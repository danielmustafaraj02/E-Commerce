# E-Commerce — Murano glass jewelry store

A Next.js storefront + admin for selling Murano-glass jewelry (bracelets, necklaces, earrings), built on Postgres/Prisma, Stripe/PayPal, and deployed on Vercel.

This file is the **entry point**: local setup, then the ordered path to a safe public launch, then branding. Full detail for each step lives in `docs/` — this page tells you the order to do things in and links out.

---

## Current status (as of 2026-09-15)

The site is **already deployed and reachable in production** (`vercel ls` shows a Ready deployment on a `*.vercel.app` URL, `/api/health` returns `200`), backed by a real Neon Postgres database provisioned through the Vercel Marketplace. That's further along than "step 2" below assumes — but **it is not yet safe to advertise or take real orders on.** Verified directly against the live deployment:

| | Status | Detail |
| --- | --- | --- |
| 🔴 | **Admin account not secured** | The seeded credentials (`admin@demo-store.example` / `ChangeMe123!` — public, in this file) still log in on production right now. Anyone who reads this README can get an admin session. **Fix this before anything else** — see the callout right below. |
| 🟡 | Payments not configured | No `STRIPE_*` or `PAYPAL_*` env vars are set in Production — checkout will not be able to take real payments yet. |
| 🟡 | Transactional email not configured | No `RESEND_API_KEY`/`EMAIL_FROM` in Production — order confirmations, newsletter campaigns, and password-related emails won't send. |
| 🟡 | Bot protection not configured | No `TURNSTILE_*` in Production — signup/contact/checkout forms have no CAPTCHA layer yet. |
| 🟡 | Rate limiting is best-effort only | No `UPSTASH_REDIS_*` in Production, so `src/lib/rate-limit.ts` falls back to an in-memory limiter — it works, but resets on every redeploy and isn't shared across serverless instances. Fine short-term, not what you want at real traffic. |
| 🟡 | No custom domain | `vercel domains ls` returns none — the site is only reachable on its `vercel.app` URL. |
| 🟡 | Store name is stale in the live DB | Production's `StoreSettings.storeName` is still an old placeholder value, not `Gem Murano Glass` — the codebase's seed default was updated (`prisma/seed.ts`), but `db:seed`'s `upsert` doesn't touch an existing row, so the live DB needs updating from **Admin → Settings** directly. |
| 🟢 | Core app | Build, lint, and the full test suite (31 tests) all pass. CSP/HSTS/security headers, the admin-session age ceiling, and Zod validation are live and working as designed. |

### 🚨 Do this first: rotate the admin password

The default admin login is public knowledge (it's printed in this very file) and it currently works against your live site. Until this is fixed, treat the admin panel as compromised. There's no self-service "change password" screen yet (a real gap — only role changes exist in **Admin → Team**), so rotate it directly against the production database:

```bash
vercel env pull .env.production.local --environment=production   # your own machine, your own approval
DATABASE_URL="$(grep ^DATABASE_URL= .env.production.local | cut -d= -f2- | tr -d '"')" \
  npx tsx -e "(async()=>{const {db}=await import('./src/lib/db');const bcrypt=(await import('bcryptjs')).default;const hash=await bcrypt.hash('<pick-a-strong-password>',12);await db.user.update({where:{email:'admin@demo-store.example'},data:{passwordHash:hash}});console.log('done');})();"
rm .env.production.local   # don't leave production credentials sitting on disk
```

Then log in with the new password. While you're in Prisma Studio, also consider changing the seeded admin's email away from the public `admin@demo-store.example`, and enable TOTP MFA on the account right after (already built — Account → Security).

---

## 1. Run it locally

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL
npm run db:migrate
npm run db:seed                          # demo admin + tax/shipping baseline
npx tsx scripts/seed-murano-catalog.ts   # real product catalog from public/products/
npm run dev
```

Open http://localhost:3000. Full troubleshooting (including a known Turbopack cache crash) is in **[docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)**.

---

## 2. Go live — do these in order

The full walkthrough with commands and explanations is **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — follow that doc step by step. Short version, in the order it must happen, with what's already done on the current deployment marked:

1. ✅ **Push to Git** — Vercel deploys from a repo, not a folder upload.
2. ✅ **Provision production Postgres** — done via `vercel integration add neon` (Neon, connected to the project).
3. ⬜ **Set the remaining environment variables** — `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET` are already set in Production; `STRIPE_*`, `PAYPAL_*`, `RESEND_API_KEY`/`EMAIL_FROM`, `TURNSTILE_*`, and `UPSTASH_REDIS_*` are **not yet set** — the app runs without them (they degrade gracefully) but checkout/email/bot-protection/rate-limiting won't work for real until they are. See the doc for the full table.
4. ✅ **Deploy** — a Production deployment is live and `/api/health` returns `200`.
5. ⬜ **Run migrations** against production — confirm `npx prisma migrate deploy` has been run against the current schema (re-run it any time you change `prisma/schema.prisma`).
6. 🔴 **Change the seeded admin password** (`admin@demo-store.example` / `ChangeMe123!`) — **not yet done**, and it's the single most urgent item on this list. See the "Current status" callout above for the exact command.
7. ⬜ **Verify before telling anyone the URL** — click through home → product → cart → checkout, run through [docs/QA_BROWSER_TESTING.md](docs/QA_BROWSER_TESTING.md). Checkout can't be fully verified end-to-end yet since Stripe/PayPal aren't configured (step 3).
8. ⬜ **Point your domain at it** — no custom domain is attached yet (see the branding section below for the chosen name) and update `NEXTAUTH_URL` + Admin → Settings → Site URL to match once you do.

## 3. Before accepting real payments

Already built in: bcrypt + login lockout, per-request CSP/HSTS, verified Stripe/PayPal webhook signatures, Zod validation everywhere, Prisma-only (no raw SQL), rate limiting, audit logging, GDPR consent/export, optional TOTP MFA.

Still on you — these block *real* money moving, not just the site being reachable:

- A registered business entity (partita IVA or equivalent) — most processors require this to leave test mode.
- Electronic invoicing (fatturazione elettronica) if operating in Italy.
- Signed DPAs with Stripe/PayPal/host/Resend (usually a checkbox, just confirm it's actually done).
- VAT/OSS rules if selling into multiple EU countries — checkout currently has only one Italian VAT rule configured; non-IT destinations get 0% tax, which is a decision to make deliberately, not a bug.
- Business/cyber insurance, and a written incident-response plan (GDPR's 72-hour breach notification rule applies).

Full detail, plus the ongoing operational checklist (backups, key rotation, rollback) and the images/CDN setup: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

---

## 4. Branding — name and domain

**Chosen name: `Gem Murano Glass`** (set as the seeded `storeName` in `prisma/seed.ts`; update it again in Admin → Settings if you re-seed or change your mind). "Gem" is the most universally understood jewelry word across languages (no translation ambiguity, unlike "bijou" or "gioia"), paired with the literal "Murano Glass" for SEO — anyone searching "Murano glass jewelry" recognizes the name instantly. `.com`/`.net`/`.store` (as `gemmuranoglass.*`) were all confirmed available via live RDAP registry lookups on 2026-09-15 — re-verify at your registrar before paying, since availability can change.

Runner-up shortlist, also verified available the same day, kept here in case `Gem Murano Glass` doesn't clear a trademark/socials check: `Bijou Murano Glass`, `Joy Murano Glass` (`joyverre.com` if you want a shorter brand-only variant), `Heritage Murano Glass`, `Muranio`, `Vetrogioia`, `Ophir Murano Glass`.

### Can you actually sell under a "Murano"-rooted name?

Yes, with one caveat — relevant here because the product copy still says "Murano glass" even though the brand name itself doesn't. **"Vetro Artistico® Murano" is a legally protected collective trademark** — only glass actually made in the authorized furnaces on the island of Murano can be marketed *as certified Murano glass* under that mark ([source](https://www.yourmurano.com/en/murano-glass-trademark-origin-certified)). Using "Murano" or a variant in your *brand name* or product descriptions is fine and common (MuranoNet, Murrina Murano, etc. all do it) — it's descriptive of where the material tradition comes from. What you can't do is claim the certification itself (use the ® symbol, claim "certified Vetro Artistico® Murano") unless your glass is genuinely sourced from an authorized Murano furnace with paperwork to prove it. If your supply chain is genuine Murano glass, keep that documentation on hand; if it's "Murano-style," say so in product descriptions rather than implying certification.

### Registering it

1. Pick a name, then register the domain **and matching socials (Instagram/TikTok handle) at the same time** — handle squatting on a good name happens fast once it's live.
2. `.it` reads as more trustworthy to Italian customers if that's your primary market; `.com` if you're going EU/international from the start. Nothing stops you registering both and redirecting one to the other.
3. Point it at Vercel per step 8 above once the store is live.

---

## Docs index

| Doc | What it's for |
| --- | --- |
| [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md) | Running the server locally, known issues |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | The full step-by-step launch guide, env vars, security/legal checklist |
| [docs/QA_BROWSER_TESTING.md](docs/QA_BROWSER_TESTING.md) | Checking the site in a real browser before/after launch |
| [docs/specs/ecommerce-build-prompt.md](docs/specs/ecommerce-build-prompt.md) | Original architecture/schema/security spec |
| [docs/100_POINT_CHECKLIST.md](docs/100_POINT_CHECKLIST.md) | 100-item checklist to make the store secure, reliable, fast, and profitable |
