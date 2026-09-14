# Going live — the full technical guide

This is the complete, step-by-step path from "runs on my machine" to "publicly reachable and taking real orders." The README has a shorter version; this doc is the one to actually follow, including the parts that are easy to skip.

Reference target stack: **Vercel** (app hosting + serverless functions + cron) + **Postgres** on Railway/Supabase/Neon (any works — free tiers exist on all three). Nothing here is Vercel-specific in principle; swap in your own Node host + Postgres if you prefer, and adjust steps 2–3 accordingly.

---

## 0. Prerequisite: this folder is not a git repository yet

Vercel (and most hosts) deploy from a Git repo, not a local folder upload. Check first:

```bash
git status   # if this says "not a git repository", do the following:
git init
git add .
git commit -m "Initial commit"
```

Then create an empty repo on GitHub (or GitLab/Bitbucket) and push:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

**Before your first commit**, double check `.gitignore` actually excludes secrets — `.env*` and `*.db`/`*.db-journal` are already listed, but if you ever added a file with real keys outside those patterns, scrub it first. `dev.db` in this folder is local seed/test data; don't let it become the thing production reads from (see step 1).

---

## 1. Provision a production database (Postgres)

Local dev uses SQLite (`dev.db`) for zero-setup convenience. **Production must be Postgres** — SQLite is a single file with no concurrent-write story, not viable for a real multi-request server.

1. Create a Postgres instance on [Railway](https://railway.app), [Supabase](https://supabase.com), or [Neon](https://neon.tech) (all have a usable free/hobby tier). Copy the connection string it gives you.
2. Switch the Prisma provider from SQLite to Postgres:
   - `prisma/schema.prisma`: change the `datasource db` block's `provider` from `"sqlite"` to `"postgresql"`.
   - `src/lib/db.ts`: swap the driver adapter import from `@prisma/adapter-better-sqlite3` to `@prisma/adapter-pg` (already a listed dependency-shape in `package.json`'s ecosystem — install `@prisma/adapter-pg` if it isn't already a dependency).
3. Every field type currently used in `prisma/schema.prisma` is portable between SQLite and Postgres — no schema rewrite needed, just the provider/adapter swap above.
4. **Do this switch on a branch and test locally against a real (free-tier) Postgres instance before deploying** — don't discover an adapter mismatch for the first time in production.

---

## 2. Push the code, import into Vercel

1. Push to GitHub (step 0 above) if you haven't.
2. [vercel.com](https://vercel.com) → **Add New → Project** → select the repo.
3. Leave the framework preset as **Next.js** — this project needs no custom build config. Vercel auto-detects `npm run build`.

---

## 3. Set environment variables (in Vercel, not just `.env`)

**Vercel → Project → Settings → Environment Variables.** Your local `.env` never reaches Vercel — every value used in production has to be re-entered there. Use `.env.example` as the checklist of every key that exists; below is what's required vs. optional.

### Required — the app will not function correctly without these

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | The Postgres connection string from step 1 |
| `AUTH_SECRET` | Generate with `npx auth secret` — without it, sign-in is completely broken |
| `NEXTAUTH_URL` | Your production URL, e.g. `https://your-store.vercel.app` (update again once a custom domain is attached — see step 8) |
| `CRON_SECRET` | Any random string (`openssl rand -hex 32`) — gates `/api/cron/abandoned-orders`; without it the abandoned-cart cleanup cron either can't authenticate or runs unprotected |

### Optional at deploy time — the store works without them, features degrade gracefully

| Variable | What happens if unset |
| --- | --- |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe payment button shows "not configured" |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_WEBHOOK_ID` | Same, for PayPal |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional emails (order confirmations, abandoned-cart reminders) silently don't send |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth login option just doesn't appear |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | CAPTCHA is skipped (not broken) on forms |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting falls back to in-memory — **fine for one instance, not safe for multi-instance production** (Vercel can scale to multiple serverless instances, each with its own memory) — set these before real launch |
| `SENTRY_DSN` | No error alerting; errors still land in Vercel's function logs |
| `ADMIN_SESSION_MAX_AGE_MINUTES` | Defaults to 240 (4h) if unset |
| `ABANDONED_ORDER_REMINDER_HOURS` / `ABANDONED_ORDER_EXPIRE_HOURS` | Default to 1 / 48 if unset |
| `CLOUDINARY_*` | Only needed if you use Cloudinary as your image host — see **Images** below |

Most payment/email/integration credentials can *also* be set later from **Admin → Settings** in the running app instead of an env var + redeploy (the database value wins if both are set) — useful for rotating a key without touching Vercel.

---

## 4. Deploy

Click **Deploy**. Vercel runs `npm run build`, which runs `prisma generate` automatically via the `postinstall` script. This step does **not** run migrations or seed data — that's steps 5–6, deliberately separate so a deploy never silently mutates the production schema.

---

## 5. Run migrations against production

From your local machine (or a one-off CI/Vercel CLI step), with `DATABASE_URL` pointed at the **production** database:

```bash
DATABASE_URL="<production postgres url>" npx prisma migrate deploy
```

This does not happen automatically on every deploy — run it explicitly whenever a deploy includes a new migration.

---

## 6. Seed the initial admin account

```bash
DATABASE_URL="<production postgres url>" npx tsx prisma/seed.ts
```

This creates the seeded admin login: `admin@demo-store.example` / `ChangeMe123!`.

**Immediately sign in and change that password** (or delete/replace the account from **Admin → Team**) — it's a well-known credential published in this repo's own README, not a secret. Do this before announcing the site publicly, not after.

---

## 7. Verify before telling anyone the URL

- Visit `https://<your-vercel-url>` and click through: home → product → cart → checkout (a real test order, cancel/refund it after if using live Stripe keys — or use Stripe test mode keys first).
- `GET /api/health` should return `200` — this is the endpoint to point an uptime monitor (UptimeRobot, BetterStack, etc.) at. A broken checkout nobody notices for days is the most common way small stores quietly lose money.
- Sign in to `/admin` with the seeded (now-changed) admin login, confirm dashboard/products/orders load.
- Use [QA_BROWSER_TESTING.md](./QA_BROWSER_TESTING.md) to do a full pass against the live URL, not just localhost.

---

## 8. Point your domain at it (optional but typical)

1. Vercel → Project → Settings → Domains → add your domain, follow its DNS instructions (usually a `CNAME`/`A` record at your registrar).
2. Update `NEXTAUTH_URL` (Vercel env var) to the final domain and redeploy.
3. Update **Admin → Settings → Site URL** in the running app to match. This one is easy to miss: `sitemap.xml` and canonical/OG meta tags read this value, so a stale Site URL quietly breaks SEO metadata even though the storefront itself keeps working fine.
4. Confirm HTTPS is active (automatic on Vercel) and the old `.vercel.app` URL still works or redirects as you expect.

---

## Ongoing operational tasks (not one-time)

- **Cron:** `vercel.json` schedules `GET /api/cron/abandoned-orders` hourly via Vercel Cron, which sends `Authorization: Bearer $CRON_SECRET` automatically once that env var is set. On a non-Vercel host, point any cron service (GitHub Actions scheduled workflow, system crontab, etc.) at that URL with the same header.
- **Dependency updates:** CI (`.github/workflows/ci.yml`) already runs `npm audit --omit=dev --audit-level=high` on every push/PR — don't let that start failing silently; review and bump flagged packages promptly.
- **Key rotation:** treat Stripe/PayPal/Resend/Upstash keys as rotatable, not "set once" — rotating via **Admin → Settings** doesn't require a redeploy.
- **Backups:** set up automated backups on whichever Postgres provider you chose (Railway/Supabase/Neon all offer this), and **actually test a restore** at least once before you need it for real.
- **SSL/DNS:** certificate auto-renewal should be automatic on Vercel, but a monitoring alert as a backup costs nothing; if you manage DNS yourself, enable registrar domain-lock to prevent unauthorized transfer.

## Security checklist before accepting real payments

Already built in: bcrypt password hashing + login lockout, per-request nonce-based CSP + HSTS/X-Frame-Options, verified Stripe/PayPal webhook signatures, Zod validation on every input, Prisma (no raw SQL), rate limiting on auth/checkout/contact/reviews, audit logging on admin mutations, GDPR consent logging + data export + legal pages, MFA (TOTP) available per-account. See the full original spec at [`docs/specs/ecommerce-build-prompt.md`](./specs/ecommerce-build-prompt.md) §8 (baseline security requirements) and §13 (deeper safety pass: Magecart/checkout-skimming mitigations, infrastructure hardening, session hardening, upload security, incident response).

Still your responsibility, not code:

- **Staging vs. production separation** — separate database and API keys; never test against live customer data or real Stripe keys.
- **A WAF** at your CDN/host layer.
- **Business/legal operational items** — these block *real* payment processing, not just the site being reachable:
  - Registered business entity (partita IVA / equivalent) — most payment processors require this to fully activate a live (non-test) account.
  - Electronic invoicing (fatturazione elettronica) if operating in Italy — a legal requirement separate from generating a PDF receipt.
  - Signed Data Processing Agreements (DPAs) with every subprocessor touching customer data — Stripe, PayPal, your host, Resend. Most offer a standard DPA you just need to accept; confirm it's actually done.
  - Consult an accountant on VAT/OSS rules before selling into multiple EU countries — see the related open finding in [`reports/qa-log.md`](../reports/qa-log.md) (checkout currently has only one Italian VAT rule configured; non-IT destinations get 0% tax applied, which is a real business decision to make, not a bug to code around blindly).
  - Business/cyber insurance — worth pricing out once processing real transactions.
  - A written incident response plan (contain → assess → notify → remediate) and awareness of the GDPR 72-hour breach notification rule.

## Images in production

No upload pipeline in the app itself (by design — see `docs/specs/ecommerce-build-prompt.md` §13.4 on why a web upload endpoint is a real attack surface). Admin → Products takes an already-hosted image URL. Pick an image host/CDN (Cloudinary, S3 + CloudFront, etc.) and paste URLs there, or use `scripts/import-products.ts` locally to bulk-import a folder of photos before you ever deploy — see the main [README](../README.md#images) for that script's usage.

## Rolling back a bad deploy

Vercel keeps every previous deployment — **Project → Deployments → (previous one) → Promote to Production** instantly points production traffic back at the last good build, no rebuild needed. This does **not** roll back the database — a migration applied in step 5 stays applied. Keep migrations backward-compatible (additive, not destructive) where practical so a code rollback doesn't strand the DB in a state the old code can't read.
