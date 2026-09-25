# Deployment Guide

## Current live deployment

| Piece | URL | Platform |
|---|---|---|
| Storefront | https://f1-e-comm-client.vercel.app | Vercel |
| API | https://f1-e-comm.onrender.com/api/v1 | Render (free tier) |
| Swagger | https://f1-e-comm.onrender.com/api-docs | Render |
| Database | `...acjlg4v.mongodb.net` | MongoDB Atlas M0 |

The two cross-references that must stay in sync:

- Render's `CLIENT_URL` = `https://f1-e-comm-client.vercel.app` (CORS)
- Vercel's `VITE_API_BASE_URL` = `https://f1-e-comm.onrender.com/api/v1` (API calls)

> ⚠️ The Atlas connection string has no database path, so the data lives in a database literally named **`test`** rather than `shopswift`. It works because both the seed script and Render use the same string — but if you ever append `/shopswift` to one and not the other, the site will silently go empty. Normalize both at once if you change it.

---

This is a monorepo with two deployable apps. **They do not go to the same place.**

| App | Platform | Why |
|---|---|---|
| `client/` (Vite SPA) | **Vercel** | Static build output — exactly what Vercel is for. |
| `server/` (Express API) | **Render** | `src/index.ts` calls `app.listen()` — a persistent process. Vercel runs serverless functions, which would need a rewritten handler export, Mongoose connection caching, and different Stripe raw-body handling. |
| Database | **MongoDB Atlas** | Free M0 tier. |

> **Do not import `server/` into Vercel.** Vercel's import dialog offers it (it detects Express), but the app will not run there without a significant rewrite. The repo ships [`render.yaml`](../render.yaml) for the API instead.

---

## Order of operations

The two apps each need the other's URL, so there's a deliberate order that avoids redeploying twice:

```
1. Atlas        → get MONGODB_URI
2. Render (API) → get https://<api>.onrender.com     (CLIENT_URL is a placeholder for now)
3. Vercel (UI)  → get https://<app>.vercel.app        (uses the real Render URL)
4. Back to Render → set the real CLIENT_URL           (unblocks CORS)
5. Stripe webhook → point at Render, copy secret back to Render
6. Seed the production database (once)
```

---

## 1. MongoDB Atlas

1. Create a free **M0** cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → add a database user, save the password.
3. **Network Access** → allow `0.0.0.0/0`.
   Render's free tier has dynamic outbound IPs, so there's no stable address to allowlist. The app's own JWT auth still gates every read and write — this is the standard trade-off for this hosting tier.
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopswift?retryWrites=true&w=majority
   ```
   Substitute your real password and keep `/shopswift` as the database name.

---

## 2. Render — the API

Render reads [`render.yaml`](../render.yaml) as a Blueprint, so build and start commands, the health check, and most env vars are already configured.

1. Push to GitHub (already done if `git remote -v` shows your repo).
2. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → select the repo.
3. Render detects `render.yaml` and shows one service: `shopswift-api`.
4. Fill in the env vars it prompts for (everything marked `sync: false`):

| Key | Value |
|---|---|
| `MONGODB_URI` | Your Atlas string from step 1. **Not** `mongodb://127.0.0.1:...` — Render cannot reach your laptop. |
| `CLIENT_URL` | `http://localhost:5173` for now. Corrected in step 4. |
| `STRIPE_SECRET_KEY` | Your `sk_test_...` from [Stripe → API keys](https://dashboard.stripe.com/test/apikeys). The **secret** key, not the publishable one. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_placeholder` for now. Corrected in step 5. |
| `SEED_ADMIN_EMAIL` | `admin@shopswift.dev` |
| `SEED_ADMIN_PASSWORD` | Your choice — this becomes a public demo login. |
| `SEED_RACETEAM_PASSWORD` | Your choice. |
| `SEED_CUSTOMER_PASSWORD` | Your choice. |

**Set automatically by the blueprint — do not add these manually:**
`NODE_ENV`, `PORT`, `API_PREFIX`, `ENABLE_SWAGGER`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, and `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (auto-generated).

> Never reuse your local dev JWT secrets in production. Let Render generate fresh ones — that's what `generateValue: true` in the blueprint does.

`COOKIE_DOMAIN` appears in `server/.env.example` but is not used anywhere in the code. Skip it.

5. Deploy. First build takes a few minutes.
6. Verify: `https://<your-api>.onrender.com/api/v1/health` returns 200, and `/api-docs` loads Swagger.

**Copy the Render URL — you need it in the next step.**

---

## 3. Vercel — the client

1. [vercel.com/new](https://vercel.com/new) → import the same repo.
2. When it offers both deployable directories, **choose `client`**.
3. **Root Directory:** `client`
4. **Critical:** enable **"Include source files outside of the Root Directory in the Build Step."**
   [`client/vercel.json`](../client/vercel.json) runs `cd .. && npm ci --include=dev && npm run build -w shared && npm run build -w client`, because the client imports `@shopswift/shared` from the workspace root. Without this setting, Vercel only uploads `client/` and the build fails on the missing root `package.json` and `shared/`.
5. Framework preset should read **Vite** (set by `vercel.json`). Leave build and output settings alone — `vercel.json` supplies them.
6. Add environment variables:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-api>.onrender.com/api/v1` — the Render URL from step 2, **including `/api/v1`**. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your `pk_test_...` from Stripe. The **publishable** key, not the secret one. |

> These are baked in at build time by Vite, not read at runtime. Changing them later requires a redeploy, not just a restart.

7. Deploy. **Copy the resulting `https://<app>.vercel.app` URL.**

---

## 4. Wire them together

Back in Render → your service → **Environment** → set:

```
CLIENT_URL = https://<your-app>.vercel.app
```

Save; Render redeploys automatically. This unblocks CORS — until now the API was rejecting browser requests from the Vercel domain.

Cross-domain auth cookies already work: Render and Vercel are different domains, and [`server/src/utils/cookies.ts`](../server/src/utils/cookies.ts) sets `sameSite: 'none'; secure: true` when `NODE_ENV=production`.

---

## 5. Stripe webhook

The webhook is the **only** thing that marks an order paid — without it, orders sit in `pending` forever even after a successful card charge.

1. [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks) → **Add endpoint**.
2. Endpoint URL: `https://<your-api>.onrender.com/api/v1/payments/webhook`
3. Events to send: `payment_intent.succeeded` and `payment_intent.payment_failed`.
4. Copy the **Signing secret** (`whsec_...`).
5. Render → Environment → replace the `STRIPE_WEBHOOK_SECRET` placeholder with it. Save and let it redeploy.

---

## 6. Seed the production database

Run once, from your machine, pointed at Atlas:

```bash
MONGODB_URI="<your-atlas-uri>" NODE_ENV=production npm run seed -w server -- --force
```

`--force` is required because the script refuses to seed a production database without it. **This clears existing data** — run it once, before you have real data you care about.

This creates the 10 F1 teams, an admin, one approved race-team account per team, demo customers, products, offers, and orders — so every dashboard has data on first load.

---

## Post-deploy checklist

- [ ] `https://<api>.onrender.com/api/v1/health` → 200
- [ ] `https://<api>.onrender.com/api-docs` → Swagger UI loads
- [ ] Vercel URL loads the storefront, products and teams render (proves `VITE_API_BASE_URL` and CORS are correct)
- [ ] Log in as the seeded admin → lands on `/admin`, not the storefront
- [ ] Log in as a customer → add to cart → checkout → card fields render (proves `VITE_STRIPE_PUBLISHABLE_KEY` is a real key)
- [ ] Pay with `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] Order flips from `pending` to `paid` within a few seconds (proves the webhook and `STRIPE_WEBHOOK_SECRET` are correct)
- [ ] Stripe Dashboard → Webhooks → your endpoint shows a `200` delivery

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Build fails: `sh: 1: husky: not found` / `npm error code 127` | The install omitted devDependencies. Both platforms set `NODE_ENV=production`, which makes npm skip them — so the `prepare` script's `husky` binary is missing. The build command must be `npm ci --include=dev`. (Root `package.json` also guards this with `"prepare": "husky \|\| true"`.) |
| Build fails: `tsc: not found` or `vite: not found` | Same root cause as above — `typescript` and `vite` are devDependencies. Use `npm ci --include=dev`. |
| Render logs `Using Node.js version 26.x` | Root `package.json` engines was a floating range. It's pinned to `22.x` to match the Dockerfile and local dev. |
| Vercel build: `Cannot find module '@shopswift/shared'` or missing root `package.json` | "Include source files outside of the Root Directory" is off — step 3.4. |
| UI loads but every API call fails with a CORS error | `CLIENT_URL` on Render doesn't exactly match the Vercel origin (check `https://`, no trailing slash). |
| API calls 404 | `VITE_API_BASE_URL` is missing the `/api/v1` suffix. |
| Checkout shows no card fields | `VITE_STRIPE_PUBLISHABLE_KEY` is a placeholder, or it's the secret key by mistake. Redeploy after fixing — Vite inlines it at build time. |
| `This API call cannot be made with a publishable API key` | `STRIPE_SECRET_KEY` on Render is a `pk_test_...` key. It must be `sk_test_...`. |
| Payment succeeds but the order stays `pending` | Webhook not configured, or `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint's signing secret. Check the Stripe webhook delivery log. |
| First request after idle takes 30–50s | Render free-tier cold start. Expected. |
| Login works, then refresh logs you out | `NODE_ENV` isn't `production` on Render, so cookies aren't `sameSite: 'none'` and are dropped cross-domain. |
