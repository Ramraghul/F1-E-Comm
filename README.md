# 🏎️ Shop Swift — F1 Team Merchandise Platform

A full-stack, F1-themed **multi-vendor e-commerce platform** built as a portfolio project. Every one of the 10 real Formula 1 constructor teams runs its own storefront — managed by a **Race Team** account — inside one shared marketplace, with an **Admin** overseeing the whole site and **Users** shopping across every team.

Built with the MERN stack in TypeScript: **Node/Express/MongoDB** on the backend, **React/Redux Toolkit/Vite** on the frontend, **Stripe** (test mode) for checkout, full **Jest** test suites on both sides, and a documented **Swagger/OpenAPI** contract.

> This is a demo/portfolio application. It is not affiliated with Formula 1, FIA, or any constructor team — team names, colors and logos are used for demonstration purposes only.

---

## 🔗 Live demo

| | |
|---|---|
| **Storefront** | **https://f1-e-comm-client.vercel.app** |
| **API docs (Swagger)** | **https://f1-e-comm.onrender.com/api-docs** |
| **API health** | https://f1-e-comm.onrender.com/api/v1/health |

> ⏳ **First load may take 30–50 seconds.** The API runs on Render's free tier, which spins the instance down after inactivity — the first request wakes it back up. Subsequent requests are fast. The app isn't broken, it's just waking up.

Sign in with the [demo credentials](#demo-credentials) below to explore all three roles. The Swagger UI is fully interactive — log in via `POST /auth/login`, click **Authorize**, paste the access token, and you can exercise every protected endpoint straight from the browser.

Payments run in **Stripe test mode** — use card `4242 4242 4242 4242`, any future expiry, any CVC. No real charges are possible.

---

## Table of contents

- [Live demo](#-live-demo)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Quick start (Docker)](#quick-start-docker)
- [Manual local setup](#manual-local-setup)
- [Demo credentials](#demo-credentials)
- [Testing](#testing)
- [API docs (Swagger)](#api-docs-swagger)
- [Environment variables](#environment-variables)
- [Stripe test-mode checkout](#stripe-test-mode-checkout)
- [Deployment (free tier)](#deployment-free-tier)
- [Project structure](#project-structure)
- [Known simplifications](#known-simplifications)

---

## Features

### 👤 User (customer)
- Browse/search/filter products by team, category, price, rating
- Team storefronts with team-colored theming, drivers, and team-specific offers
- Cart that works as a guest (localStorage) and merges into your account on login
- Multi-step checkout: address → coupon → Stripe payment
- Order history, order detail, cancel a still-pending order
- Product reviews with a "Verified Purchase" badge

### 🏁 Race Team (multi-vendor seller)
- Self-service signup, scoped to one F1 team, **pending admin approval** before login works
- Full CRUD on their own team's products only (enforced server-side, not just hidden in the UI)
- Create team-scoped coupons (flash sales, race-weekend specials)
- Team-only analytics dashboard: revenue, orders, top products, low-stock alerts
- Advance order fulfillment status (`processing → shipped → delivered`) for orders containing their items

### 🛠️ Admin
- Site-wide analytics: revenue, orders, users, revenue-by-team chart
- Approve/reject pending Race Team applications
- Full CRUD over teams, products, offers, orders, and users
- Manage any order's full status lifecycle

### 🎟️ Offers engine
- Global (site-wide) or team-scoped coupons
- Percent or flat discounts, minimum order value, max discount cap, usage limits (total and per-user)
- Flash-sale / race-weekend tags with a live countdown banner
- A team-scoped coupon only discounts that team's line items in a mixed-team cart

---

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Node.js 22, Express 5, TypeScript, Mongoose/MongoDB, Zod validation, JWT (access + rotating refresh), Stripe |
| Frontend | React 18, TypeScript, Vite, Redux Toolkit + RTK Query, React Router v6, Tailwind CSS, Framer Motion, Recharts, Stripe Elements |
| Shared | `@shopswift/shared` — types & constants used by both sides (npm workspace) |
| Testing | Jest + Supertest + `mongodb-memory-server` (backend), Jest + React Testing Library (frontend) |
| Docs | Swagger UI / OpenAPI 3 (`swagger-jsdoc`) at `/api-docs` |
| Infra | Docker Compose (local dev), Render (API), Vercel (frontend), MongoDB Atlas (database) |

## Architecture

npm workspaces monorepo:

```
shared/   — TS types & constants shared by server and client (roles, order status, the 10 F1 teams, DTOs)
server/   — Express API (REST, /api/v1), Mongoose models, Stripe webhook, Swagger, tests, seed script
client/   — React SPA (Vite), Redux Toolkit store, RTK Query API slices, F1-themed UI
```

See [`docs/architecture.md`](docs/architecture.md) for the full data model, API surface, auth design, and offers-engine logic.

---

## Quick start (Docker)

The fastest path to a running app — one command, no local Node/Mongo install required.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up --build
```

Then, in another terminal, seed the database with 10 teams, demo accounts, a ~230-item realistic merchandise catalog (team polos, jackets, caps, die-cast model cars, driver-specific items, etc.), offers, and 40 orders:

```bash
docker compose exec server npm run seed
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/v1
- Swagger docs: http://localhost:5000/api-docs

Stripe checkout won't complete payments until you add real **test-mode** keys to `server/.env` (see [Stripe test-mode checkout](#stripe-test-mode-checkout)) — everything else works out of the box.

---

## Manual local setup

Requires Node.js ≥ 20 and a MongoDB instance (local `mongod`, or use `docker compose up -d mongo`).

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure env vars
cp server/.env.example server/.env
cp client/.env.example client/.env
# edit server/.env — at minimum set MONGODB_URI and generate real JWT secrets:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Build the shared package (server/client both import compiled output in dev)
npm run build -w shared

# 4. Seed demo data
npm run seed -w server

# 5. Run both apps in dev mode (with hot reload)
npm run dev
```

`npm run dev` runs `shared` in watch mode plus the server (`tsx watch`) and client (Vite) concurrently. If you only want one side: `npm run dev -w server` or `npm run dev -w client`.

---

## Demo credentials

Created by `npm run seed -w server` (values configurable via `server/.env`):

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@shopswift.dev` | `Admin@12345` | Full site access |
| Race Team | `raceteam+mercedes@shopswift.dev` | `RaceTeam@12345` | One approved account per team — swap `mercedes` for any team slug (`ferrari`, `mclaren`, `red-bull-racing`, `aston-martin`, `alpine`, `williams`, `racing-bulls`, `kick-sauber`, `haas`) |
| Race Team (pending) | `raceteam+pending@shopswift.dev` | `RaceTeam@12345` | Blocked at login — use this to demo the admin approval flow |
| Customer | `customer@shopswift.dev` | `Customer@12345` | Has order history to browse |

---

## Testing

```bash
npm test              # server + client
npm run test:server   # 60+ Jest/Supertest tests — unit (offers engine, order state machine) + integration (auth, RBAC, cart, orders, Stripe webhook)
npm run test:client   # Jest/RTL tests — components, Redux slices, route guards
```

Backend tests spin up an isolated **in-memory MongoDB** per test file (`mongodb-memory-server`) — no real database needed, nothing touches your dev data. Stripe calls are mocked in tests; no network or API key required to run the suite.

Notable coverage: password hashing, refresh-token rotation *and* reuse-detection (including a concurrent-request race regression test), role-based access control on products/offers (including tamper attempts), the offers engine's edge cases (expiry, usage limits, min order value against the *eligible* subtotal, team-scoped discount isolation in a mixed cart), server-side order re-pricing, idempotent Stripe webhook handling, and illegal order-status transitions.

---

## API docs (Swagger)

- **Live:** **https://f1-e-comm.onrender.com/api-docs** (give it 30–50s on the first hit — free-tier cold start)
- **Local:** http://localhost:5000/api-docs once the server is running

Every protected endpoint documents its required role(s). To try protected routes directly from the docs UI:

1. Run `POST /auth/login` with one of the [demo credentials](#demo-credentials) — e.g. `admin@shopswift.dev` / `Admin@12345`
2. Copy `data.tokens.accessToken` from the response
3. Click **Authorize** (top right), paste the token, and every subsequent "Try it out" call is authenticated

Role-gated routes return `403` if the token's role doesn't match — for example, a Race Team token can only touch its own team's products and offers. The raw OpenAPI JSON is at [`/api-docs.json`](https://f1-e-comm.onrender.com/api-docs.json).

---

## Environment variables

### `server/.env` (see `server/.env.example`)

| Var | Purpose |
|---|---|
| `MONGODB_URI` | Mongo connection string (local, Docker, or Atlas) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Sign the two token types — generate real random values, don't ship the placeholders |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | From your Stripe **test mode** dashboard |
| `CLIENT_URL` | Used for CORS |
| `ENABLE_SWAGGER` | Toggle `/api-docs` |
| `SEED_*` | Demo account emails/passwords used by the seed script |

### `client/.env` (see `client/.env.example`)

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | e.g. `http://localhost:5000/api/v1` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe **publishable** test key |

---

## Stripe test-mode checkout

1. Create a free Stripe account, switch to **test mode**.
2. Copy the test **secret key** into `server/.env` (`STRIPE_SECRET_KEY`) and the test **publishable key** into `client/.env` (`VITE_STRIPE_PUBLISHABLE_KEY`).
3. For the webhook (which is the *only* thing that marks an order paid — see [Known simplifications](#known-simplifications)), run the Stripe CLI locally:
   ```bash
   stripe listen --forward-to localhost:5000/api/v1/payments/webhook
   ```
   Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.
4. Checkout with the standard test card: `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.

---

## Deployment (free tier)

Recommended combo: **Render** (API) + **Vercel** (frontend) + **MongoDB Atlas** (database) — all have generous free tiers.

> **[`docs/deployment.md`](docs/deployment.md) is the full step-by-step runbook** — exact ordering, every env var, the Vercel monorepo setting that trips people up, a post-deploy checklist, and a troubleshooting table. The summary below is the short version.
>
> The API deploys to **Render, not Vercel** — `server/src/index.ts` runs a persistent `app.listen()` server, which Vercel's serverless model doesn't support without a rewrite.

### 1. MongoDB Atlas
Create a free **M0** cluster, a database user, and under Network Access allow `0.0.0.0/0` (Render's free tier has dynamic outbound IPs — the app's own auth still gates all data access, so this is a standard, accepted trade-off for this hosting tier). Copy the connection string.

### 2. Render (API)
This repo includes [`render.yaml`](render.yaml) as a Blueprint. Push to GitHub, then in Render: **New → Blueprint**, point it at the repo. It sets build (`npm ci && npm run build -w shared && npm run build -w server`) and start (`npm run start -w server`) commands and a health check at `/api/v1/health`. In the dashboard, fill in the env vars marked `sync: false`: `MONGODB_URI`, `CLIENT_URL` (your Vercel URL), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the `SEED_*` values. `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are auto-generated by the blueprint.

In the Stripe dashboard, add a webhook endpoint pointing at `https://<your-render-app>.onrender.com/api/v1/payments/webhook`, listening for `payment_intent.succeeded` and `payment_intent.payment_failed`, and put its signing secret into `STRIPE_WEBHOOK_SECRET`.

Once deployed, run the seed script once against production (from your machine, with `MONGODB_URI` and other server env vars pointed at Atlas/Render's values): `npm run seed -w server -- --force` (add `--force` because the guard refuses to seed when `NODE_ENV=production`; only do this once, since it clears existing data).

Render's free tier cold-starts after inactivity (~30–50s) — expected demo behavior, not a bug.

### 3. Vercel (frontend)
Import the repo in Vercel, set the root/output per [`client/vercel.json`](client/vercel.json) (it already sets the build command and SPA rewrite). Add env vars `VITE_API_BASE_URL` (your Render API's `/api/v1` URL) and `VITE_STRIPE_PUBLISHABLE_KEY`.

### 4. Wire them together
Set `CLIENT_URL` on Render to your Vercel URL (for CORS) and `VITE_API_BASE_URL` on Vercel to your Render URL (for API calls). Cross-domain cookies (Render ↔ Vercel are different domains) are already configured for this in `server/src/utils/cookies.ts` (`sameSite: 'none'; secure: true` in production).

---

## Project structure

```
shared/src/
  types/        DTOs shared by both apps (User, Team, Product, Order, Offer, …)
  constants/    roles, order-status state machine, the 10 real F1 teams

server/src/
  config/       env validation (zod), db connection, Stripe client, Swagger spec
  models/       Mongoose schemas
  middleware/   auth (JWT), rbac (role + team-ownership), validation, error handling
  services/     auth, token, offer engine, order engine (the business logic)
  controllers/  thin HTTP layer calling services
  routes/       Express routers + inline Swagger JSDoc annotations
  validators/   Zod request schemas
  seed/         seed.ts + reusable data factories (also used by tests)
server/tests/
  unit/         offer engine, order state machine
  integration/  auth, RBAC, cart, products, offers, orders + Stripe webhook, admin, reviews

client/src/
  app/          Redux store, typed hooks, the RTK Query base query (with token refresh)
  features/     one folder per domain — Redux slice and/or RTK Query API + hooks
  components/   shared UI (ProductCard, CartDrawer, Modal, Stepper, forms, …)
  layouts/      MainLayout / AdminLayout / RaceTeamLayout (+ shared DashboardShell)
  routes/       ProtectedRoute / RoleRoute guards, the route tree
  pages/        one file per route, incl. pages/admin/* and pages/raceteam/*
```

## Known simplifications

Documented trade-offs made deliberately for portfolio scope — not oversights:

- **One order can span multiple teams.** Rather than splitting a mixed-team cart into per-vendor sub-orders, each line item carries a denormalized `team` field; a Race Team's dashboard/order list filters by that field. Fulfillment status is tracked at the order level, not per-vendor.
- **The Stripe webhook is the only source of truth for payment state** — the client's `confirmPayment` call only drives the "processing…" UI. This is correct practice, but means local checkout testing needs the Stripe CLI forwarding webhooks (see above).
- **Offer redemption is counted at order creation (pending), not at payment success**, and reverted if payment fails — this protects a limited-quantity coupon from being over-redeemed by concurrent checkouts, at the cost of briefly "spending" a redemption on an order that's later abandoned before payment.
- **Atlas network access is `0.0.0.0/0`** on the free tier, since Render's free plan doesn't offer static outbound IPs — acceptable because the database itself isn't exposed to unauthenticated access, the app's own auth is.
- **Product images** are generated, self-contained SVG icon cards (`server/src/utils/productImage.ts`) — a category glyph (shirt, cap, model car, trophy, tag, star) over the team's brand color, encoded as a `data:` URI — not real merchandise photography, since licensed team photos aren't something this project has rights to use or redistribute. No external image host or network dependency either way. Swap `images` on any product (via the admin or race-team dashboard) for real photo URLs at any time.
