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

**Before your first commit**, double check `.gitignore` actually excludes secrets — `.env*` (including `.env.local`, which `vercel env pull` writes real credentials into) is already listed, but if you ever added a file with real keys outside those patterns, scrub it first.

---

## 1. Provision a production database (Postgres)

`prisma/schema.prisma` and `src/lib/db.ts` are already wired for Postgres (`@prisma/adapter-pg`) — there's no SQLite-to-Postgres switch to make, just a real instance to point `DATABASE_URL` at.

Two ways to get one:

- **Fastest — Vercel Marketplace, from the CLI**, once the project is linked (`vercel link`):
  ```bash
  vercel integration add neon
  ```
  This provisions a Neon Postgres database, connects it to the project, and injects `DATABASE_URL` (plus a few Neon/`POSTGRES_*` aliases) into **Production, Preview, and Development** env vars automatically — no manual copy-pasting a connection string into Vercel's dashboard. It does open a browser tab to accept Neon's marketplace terms once, per account.
- **Manual** — create an instance on [Railway](https://railway.app), [Supabase](https://supabase.com), or [Neon](https://neon.tech) directly and copy its connection string into Vercel yourself (step 3).

Either way, pull the resulting env vars locally when you need to run migrations/seeds against production from your machine:
```bash
vercel env pull .env.local   # writes DATABASE_URL etc.; already git-ignored
```

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

Click **Deploy**. Vercel runs `npm install` (which runs `prisma generate` via the `postinstall` script), then `npm run build`. This step does **not** run migrations or seed data — that's steps 5–6, deliberately separate so a deploy never silently mutates the production schema.

**Set `DATABASE_URL` (step 3) *before* this first deploy, not after.** `prisma generate` itself tolerates a missing `DATABASE_URL` (it only reads the schema, doesn't connect), but `next build` prerenders pages — including `/robots.txt`, `/sitemap.xml`, and every product/category page — some of which query the database (`getStoreSettings()`, product listings) at build time. If `DATABASE_URL` isn't set and reachable from Vercel's build environment at that point, the build fails with a Prisma "Can't reach database server" error, not a clear "env var missing" one. If you do hit that, it almost always means `DATABASE_URL` is missing or scoped to the wrong environment (Production vs. Preview) in step 3 — check there first.

---

## 5. Run migrations against production

From your local machine (or a one-off CI/Vercel CLI step), with `DATABASE_URL` pointed at the **production** database:

```bash
DATABASE_URL="<production postgres url>" npx prisma migrate deploy
```

This does not happen automatically on every deploy — run it explicitly whenever a deploy includes a new migration.

---

## 6. Seed data

```bash
DATABASE_URL="<production postgres url>" npx tsx prisma/seed.ts
```

This creates store settings (storeName defaults to "Demo Store" — change it from **Admin → Settings** or it'll show on the live site), the tax/shipping baseline (IT standard VAT, EU shipping zone, standard/express methods), the seeded admin login (`admin@demo-store.example` / `ChangeMe123!`), and — worth knowing so it isn't a surprise — a generic "Electronics"/"Home Goods" category with 4 filler products, meant for previewing the template. Delete those from **Admin → Products/Categories** (or via Prisma Studio) once you've confirmed the seed ran; they're not part of the real catalog.

**Immediately sign in and change that password** (or delete/replace the account from **Admin → Team**) — it's a well-known credential published in this repo's own README, not a secret. Do this before announcing the site publicly, not after.

For the actual Murano jewelry catalog, run the dedicated import instead (the photos already live under `public/products/`, this just creates the matching database rows — see the script's own header comment for how the matching works):

```bash
DATABASE_URL="<production postgres url>" npx tsx scripts/seed-murano-catalog.ts --dry-run   # preview first
DATABASE_URL="<production postgres url>" npx tsx scripts/seed-murano-catalog.ts             # then run for real
```

It's idempotent — re-running it skips any product whose image URL is already in the database, so it's safe to run again after adding new photos to `public/products/` and `scripts/murano-manifest.json`.

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

- **Cron:** `vercel.json` schedules `GET /api/cron/abandoned-orders` once daily (03:00 UTC) via Vercel Cron — Hobby plan only allows daily cron schedules, not hourly/minute-level ones; upgrade to Pro if you need finer granularity. It sends `Authorization: Bearer $CRON_SECRET` automatically once that env var is set. On a non-Vercel host, point any cron service (GitHub Actions scheduled workflow, system crontab, etc.) at that URL with the same header on whatever schedule you like.
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
