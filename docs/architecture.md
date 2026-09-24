# Architecture

## Data model (Mongoose, MongoDB)

All prices are stored as **integer cents** to avoid floating-point rounding errors; the frontend formats them for display (`lib/format.ts`).

- **User** — `name`, `email`, hashed `password`, `role: user | admin | raceteam`, `team` (ref, required iff `role === 'raceteam'`), `isApproved` (raceteam accounts start `false`), `isActive`, `addresses[]`, `refreshTokens[]` (`{tokenHash, jti, expiresAt, revokedAt}` — see [Auth](#auth--rbac)).
- **Team** — the 10 real F1 constructors: `name`, `slug`, `nationality`, `colorPrimary/Secondary/Accent` (drives per-team theming), `drivers[]`, `foundedYear`, `principal`.
- **Product** — `team` ref (required), `category`, `price`, `stock`, `images[]`, `sku`, `createdBy`, denormalized `ratingsAverage/ratingsCount`. Indexed by `{team, category}` and a text index on `name/description`.
- **Order** — `user`, `items[]` (each line denormalizes its own `team`, `unitPrice`, `subtotal` at time of purchase — a cart can span multiple teams), `shippingAddress`, `itemsTotal`, `discountAmount`, `appliedOffer` snapshot, `shippingFee`, `totalAmount`, `paymentIntentId`, `paymentStatus`, `status` (state machine, see below), `statusHistory[]`, `lastWebhookEventId` (idempotency guard).
- **Offer** — `code`, `discountType: percent | flat`, `scope: global | team` (+ `team` ref if scoped), `minOrderValue`, `maxDiscountAmount`, `usageLimit`/`usageLimitPerUser`/`usedCount`, `startsAt`/`expiresAt`, `tag` (flash-sale/race-weekend/…), `createdBy`/`createdByRole`.
- **Review** — `product`, `user`, `rating`, `comment`, `isVerifiedPurchase`; unique per `(product, user)`.
- **Cart** — one server-side document per authenticated user (`{user, items: [{product, quantity}]}`). Guests use a Redux slice persisted to `localStorage`; on login, the guest cart is merged into the server cart via `POST /cart/merge`, then cleared. Checkout always re-prices from the live `Product` documents — client-sent prices are never trusted.

## API surface (`/api/v1`)

| Resource | Highlights |
|---|---|
| `/auth` | register, register/raceteam (pending approval), login, refresh, logout, forgot/reset password, me |
| `/users` | self profile + password; admin list/manage/approve/deactivate/delete |
| `/teams` | public browse; admin CRUD |
| `/products` | public list (filter/search/sort/paginate) + detail; create/update/delete/stock restricted to admin or the owning raceteam |
| `/products/:id/reviews`, `/reviews/:id` | public list, protected create, owner/admin delete |
| `/cart` | protected CRUD + `/cart/merge` for guest→account |
| `/offers` | public active-offer listing, `/offers/validate` preview, create (admin any scope; raceteam forced to their own team), `/offers/mine` (raceteam), `/offers/all` (admin) |
| `/orders` | create (re-priced server-side + Stripe PaymentIntent), `/orders/mine`, `/orders/:id`, `/:id/cancel`, admin `GET /orders`, `/orders/team` (raceteam), `/:id/status` (transition) |
| `/payments` | create/retry PaymentIntent; `/payments/webhook` (Stripe, signature-verified, raw body) |
| `/admin` | analytics overview, sales-by-team, raceteam approval queue + approve/reject |
| `/raceteam` | own-team analytics (revenue, orders, top products, low stock) |

Full request/response schemas are in Swagger at `/api-docs` — every protected route's description states its required role(s).

## Auth & RBAC

- **JWT access token** (15 min) is returned in the login/refresh response body and kept in memory (Redux), never in `localStorage` — reduces XSS blast radius.
- **JWT refresh token** (30 days) is set as an **httpOnly, secure** cookie, scoped to `/api/v1/auth`. Its hash (not the raw token) plus a `jti` is stored server-side in `User.refreshTokens[]`, so any session can be individually revoked.
- **Rotation + reuse detection**: every `/auth/refresh` call atomically marks the presented token revoked and issues a brand-new pair (see `auth.service.ts::refresh` — this uses a single atomic `findOneAndUpdate` rather than load-then-`.save()`, specifically to stay race-safe when the same token is presented twice concurrently, e.g. two open tabs). If a token that's already revoked is presented again, every session for that user is revoked — the signal for token theft.
- **Middleware**: `protect` (verifies the bearer token), `authorize(...roles)`, and `authorizeTeamOwnership(Model)` — the single enforcement point ensuring a Race Team can only mutate `Product`/`Offer` documents belonging to their own team (admin bypasses). This is checked server-side on every write, not just hidden in the UI.
- **Race Team lifecycle**: self-registration creates the account with `isApproved: false`; login is rejected until `PATCH /admin/raceteams/:id/approve`.

## Offers engine (`services/offer.service.ts`)

A single function, `validateAndPriceOffer(lines, code, userId)`, is used both by the `/offers/validate` preview endpoint and — authoritatively — by order creation, so a client can never bypass validation by skipping the preview call.

1. Look up the code (case-insensitive), require `isActive`.
2. Check the `startsAt`/`expiresAt` window.
3. Check `usageLimit` and, by counting the user's own non-cancelled orders that reference this offer, `usageLimitPerUser`.
4. Compute the **eligible subtotal**: the whole cart for a global offer, or only that team's line items for a team-scoped offer — this is what keeps a team coupon from leaking a discount onto other teams' items in a mixed cart.
5. Enforce `minOrderValue` against that eligible subtotal (not the whole cart).
6. Compute the discount — percent capped by `maxDiscountAmount`, flat capped at the eligible subtotal itself (a total can never go negative).

One offer per order (`Order.appliedOffer` is a single object, not an array — applying a new code replaces the old one). Usage is counted (`usedCount += 1`) when the order is *created* (pending), and reverted if the Stripe webhook reports the payment failed — this protects a limited-quantity coupon from being over-redeemed by concurrent checkouts.

## Stripe flow

`POST /orders` re-validates stock and price from live `Product` data, re-runs the offers engine, creates the `Order` (`status: pending`), then creates a Stripe PaymentIntent and returns `{order, clientSecret}` in the same response. The client renders Stripe Elements with that secret.

**The webhook (`POST /payments/webhook`) is the only thing that ever marks an order paid.** It's mounted with `express.raw()` ahead of the global JSON body parser (signature verification needs the exact raw bytes), and is idempotent — it records the last processed Stripe event id on the order and no-ops on redelivery. `payment_intent.succeeded` flips the order to `paid` and decrements stock per line; `payment_intent.payment_failed` marks it `failed` and reverts any offer redemption.

Order status follows a fixed transition map (`shared/src/constants/order-status.ts`): `pending → paid → processing → shipped → delivered`, with a `cancelled` branch from `pending`/`paid`. An admin can apply any valid transition; a Race Team is restricted to the fulfillment steps (`processing → shipped → delivered`) and only on orders containing at least one of their own items.

## Frontend state

Redux Toolkit: plain slices for client-only state (`auth`, `cart` for guests, `ui` for toasts/drawers), RTK Query `createApi` slices per resource for everything server-owned. A single `baseQueryWithReauth` wraps every API slice's `fetchBaseQuery`: on a 401 (excluding the login/register/refresh endpoints themselves, where a 401 means "wrong credentials" not "expired token") it calls `/auth/refresh` once — coalescing concurrent 401s into a single in-flight refresh call — updates the token in the store, and retries the original request.
