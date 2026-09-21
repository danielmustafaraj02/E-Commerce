# Murano glass jewelry store

A Next.js storefront and admin panel for selling handmade Murano-glass jewelry
(bracelets, necklaces, earrings). Postgres + Prisma, Stripe and PayPal payments,
Auth.js (NextAuth v5) accounts with optional MFA, an 11-language storefront, and
deployment on Vercel.

**Contents** — [Overview](#overview) · [Quick start](#quick-start) ·
[Configuration](#configuration) · [Project layout](#project-layout) ·
[Scripts](#scripts) · [How it works](#how-it-works) · [Deploying](#deploying) ·
[Quality checks](#quality-checks) · [Notes](#notes) · [What to do next](#what-to-do-next)

---

## Overview

**Storefront** — home, catalog with price/stock filters and pagination, category
pages, product pages (reviews, wishlist, related items), cart, guest and account
checkout (card/wallet via Stripe, PayPal, bank transfer),
order tracking, return requests, newsletter, cookie consent, and account
self-service (data export, account deletion, MFA, password reset).

**Admin** (`/admin`) — a top bar of sections, each with its own sidebar:

| Section                 | Pages                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| Overview                | Dashboard, SEO & indexing checklist                               |
| Catalog                 | Products, categories, suppliers (dropshipping)                    |
| Sales                   | Orders, discounts, returns, shipping zones/methods, tax rules     |
| Customers               | Customers, newsletter campaigns                                   |
| Planning                | Roadmap (an in-app to-do list)                                    |
| Settings _(admin only)_ | Store settings, payments, integrations, team & roles, legal pages |

Staff accounts get everything except the Settings section.

**Languages** — English, Italian, French, German, Arabic, Chinese, Russian,
Spanish, Portuguese (European), Hindi, Japanese. Italian is the source language
of the catalog; see [Languages](#languages).

## Stack

| Concern        | Choice                                                                  |
| -------------- | ----------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack), React 19, Tailwind 4                |
| Database       | Postgres via Prisma 7 (Neon in production)                              |
| Auth           | Auth.js v5 — email + password, optional Google, optional TOTP MFA       |
| Payments       | Stripe Checkout and PayPal (hosted pages — no card data on this server) |
| Email          | Resend + React Email templates                                          |
| Bot protection | Cloudflare Turnstile (optional)                                         |
| Rate limiting  | Upstash Redis (in-memory fallback when unset)                           |
| Monitoring     | Sentry (optional), `/api/health` for uptime checks                      |
| Hosting        | Vercel                                                                  |

> **Next.js 16 differs from older versions.** `AGENTS.md` asks contributors (and
> AI assistants) to read the guides in `node_modules/next/dist/docs/` before
> writing framework code.

---

## Quick start

```bash
npm install                              # also runs `prisma generate`
cp .env.example .env                     # then fill it in — see Configuration
npm run db:migrate                       # apply migrations to your local Postgres
npm run db:seed                          # baseline data: settings, tax/shipping, an admin account
npx tsx scripts/seed-murano-catalog.ts   # the product catalog, from public/products/
npm run dev                              # http://localhost:3000
```

`db:seed` creates an admin account, `admin@demo-store.example` by default. There
is **no built-in password**: set `SEED_ADMIN_PASSWORD` (12–72 characters) and
optionally `SEED_ADMIN_EMAIL`, or let the seed generate a random password and
print it once. Admin and staff accounts must enroll in MFA on first sign-in
(Account → Security).

The seed **refuses to run when `NODE_ENV=production`** — it creates demo data. If
you seeded a database with an older version of this repo, that admin still has
the old published password: re-run the seed with `SEED_RESET_ADMIN=1` to replace
it (this also signs out any session using the old one).

Need a local Postgres? Any 14+ instance works; put its URL in `DATABASE_URL`.

---

## Configuration

Copy `.env.example` to `.env`. Most integrations can _also_ be configured at
runtime in **Admin → Settings → Payments / Integrations**; a value saved there
takes precedence over the environment variable of the same name. Anything marked
optional degrades gracefully when unset (logs instead of failing), but a public
launch needs the ones marked ★.

| Variable                                                                   | Purpose                                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `DATABASE_URL` ★                                                           | Postgres connection string                                                             |
| `AUTH_SECRET` ★                                                            | Signs sessions and the login proof cookie — `npx auth secret`                          |
| `NEXTAUTH_URL` ★                                                           | Public site URL (fallback for absolute links)                                          |
| `STRIPE_SECRET_KEY` · `STRIPE_PUBLISHABLE_KEY` · `STRIPE_WEBHOOK_SECRET` ★ | Card/wallet payments                                                                   |
| `PAYPAL_CLIENT_ID` · `PAYPAL_CLIENT_SECRET` · `PAYPAL_WEBHOOK_ID`          | PayPal payments                                                                        |
| `PAYPAL_ENV`                                                                | `sandbox` or `live`. Default: live in production, sandbox elsewhere (a Vercel preview counts as production, so set `sandbox` to test with sandbox keys) |
| `GEOCODER_URL`                                                              | Optional. Base URL of a Nominatim-compatible geocoder for the checkout address map. Default: `https://nominatim.openstreetmap.org` (free, ~1 request/second, identifies the shop by name and contact email) |
| `RESEND_API_KEY` · `EMAIL_FROM` ★                                          | Order, verification and password-reset emails                                          |
| `CRON_SECRET` ★                                                            | Authenticates the daily abandoned-order cron                                           |
| `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN` ★                    | Shared rate limiting (the in-memory fallback is per-instance)                          |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `TURNSTILE_SECRET_KEY`                  | Captcha on login, register, contact, checkout                                          |
| `SENTRY_DSN` ★                                                             | Error alerts — also how "needs manual review" payment problems reach you               |
| `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET`                                | Optional Google sign-in                                                                |
| `ADMIN_SESSION_MAX_AGE_MINUTES`                                            | Forces admin/staff to re-authenticate (default 240)                                    |
| `ABANDONED_ORDER_REMINDER_HOURS` · `ABANDONED_ORDER_EXPIRE_HOURS`          | Reminder (default 1h) and stock-hold length for unpaid card/PayPal orders (default 2h) |
| `BANK_TRANSFER_HOLD_DAYS`                                                  | Stock hold for bank-transfer orders (default 5 days)                                   |
| `NEXT_PUBLIC_IMAGE_HOSTS`                                                  | Extra remote image hosts to optimize (see [Notes](#notes))                             |

---

## Project layout

```
src/
  app/            Routes (App Router): storefront pages, /admin, /api (checkout, webhooks, cron, feeds)
  components/     UI components (CatalogImage, AdminShell, cookie banner, product cards, …)
  lib/            Domain logic — pricing, orders, payments, auth helpers, i18n, SEO, rate limiting
    i18n/         Dictionaries (UI text, 11 locales) and locale detection
  emails/         React Email templates
  proxy.ts        Request gate: admin/account access, MFA requirement, per-request CSP nonce
  auth.ts         Auth.js configuration
prisma/           schema.prisma, migrations/, seed.ts
scripts/          Catalog import/seed/translation scripts and murano-manifest.json
public/           Static assets, product photos
reports/          Local working notes (gitignored): QA log, SEO audit
```

Tests live next to the code they cover (`*.test.ts`).

---

## Scripts

| Command                                        | What it does                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev` · `build` · `start`              | Dev server · production build (runs `prisma migrate deploy` first) · run the build |
| `npm run lint` · `typecheck`                   | ESLint · TypeScript                                                                |
| `npm test` · `test:watch`                      | Vitest once · watch                                                                |
| `npm run format` · `format:check`              | Prettier                                                                           |
| `npm run db:migrate` · `db:seed` · `db:studio` | Migrations · seed · Prisma Studio                                                  |

**Catalog scripts** (`npx tsx scripts/<name>.ts [--dry-run]`) — all read
`scripts/murano-manifest.json`:

| Script                        | Use it to                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `seed-murano-catalog`         | Create the catalog on a fresh database                                                 |
| `apply-product-i18n`          | Fill translated names/descriptions (all 10 non-Italian locales) on an existing catalog |
| `update-product-descriptions` | Push edited manifest text to existing products                                         |

---

## How it works

### Checkout, payments and stock

- **Pricing is server-side.** `lib/pricing.ts` re-reads products, shipping and tax
  from the DB; client prices are never trusted.
- Placing an order creates it as `pending` and **reserves stock** immediately.
  Unpaid card/PayPal orders release their stock after `ABANDONED_ORDER_EXPIRE_HOURS`
  (default 2h); bank-transfer orders after `BANK_TRANSFER_HOLD_DAYS` (default 5).
  The daily cron does this, and checkout also releases expired holds on demand
  when an item looks out of stock. Stripe sessions expire on the same clock.
- **Webhooks are the source of truth for "paid".** Both Stripe and PayPal go
  through `lib/order-payment.ts`: the collected amount and currency must match the
  order total, and money arriving for an already-cancelled order is recorded and
  raised as an error for manual review (`SENTRY_DSN` makes that reach you).
- The PayPal return URL captures immediately for a faster confirmation page, but
  only for a payment we created for that exact order, and only if the amount matches.

### Accounts and sessions

- Sessions are JWTs, **re-checked against the database on every read**
  (`lib/session-refresh.ts`): a demoted user drops to their new role immediately,
  a deleted user is signed out, and a password reset ends every earlier session.
- **Password reset:** `/forgot-password` emails a single-use link (1 hour, only a
  hash is stored); the response never reveals whether an address has an account.
- **MFA:** required for admin/staff. Accounts with MFA, and all admin/staff
  accounts, cannot use Google sign-in (it would skip the authenticator code).
- Login has an IP rate limit, per-account lockout (5 failures → 15 min) and
  Turnstile; the two-step MFA login carries a short-lived signed proof so the
  captcha can't be skipped by sending a dummy code.

### Privacy

- The cookie banner's **analytics** choice controls Vercel Analytics and Speed
  Insights: nothing loads until a visitor accepts. The "marketing" choice is
  stored for consent records; no marketing scripts exist yet.
- `/api/account/export` (data export) and account deletion are self-service.

### Languages

- **UI text:** `src/lib/i18n/dictionaries.ts`. TypeScript enforces every locale
  has every key; `dictionaries.test.ts` also checks placeholders, script mixing,
  and that Portuguese stays European (`pt-PT`) and German stays formal.
- **Catalog text:** columns like `nameFr` / `descriptionJa` on `Product` and
  `Category`, falling back locale → English → Italian. `murano-manifest.json` is
  the source of truth; `scripts/i18n-fields.ts` lists the locales in one place.
  Adding a language means: a dictionary, the locale constant, a DB migration for
  the columns, and the manifest entries.
- Language is chosen from a cookie / `Accept-Language` on a single URL — see
  [What to do next](#what-to-do-next) for why that limits SEO.

### SEO and AI discoverability

Per-page titles/descriptions/canonicals and OpenGraph; JSON-LD for Organization,
WebSite, Product (offer, availability, shipping, returns, ratings when reviews
exist), BreadcrumbList, ItemList, FAQ and HowTo; `sitemap.xml`, `robots.txt`,
a Google Merchant feed at `/api/feeds/google-merchant`, and
[`/llms.txt`](https://llmstxt.org) — a plain-text index of the catalog and
policies for AI assistants. Private and utility pages are `noindex`.

---

## Deploying

1. Create a Postgres database (Neon via the Vercel Marketplace works well).
2. Set the environment variables above (★ ones at minimum) in Vercel.
3. `npm run build` runs `prisma migrate deploy`, so migrations apply on deploy.
4. **Do not run `db:seed` against production** (it refuses to). Create your admin
   account another way — for example seed a scratch database with a strong
   `SEED_ADMIN_PASSWORD` and copy the row, or insert the user with a bcrypt hash
   and `role = 'admin'` — then run
   `npx tsx scripts/seed-murano-catalog.ts` and `apply-product-i18n.ts` if you
   want the sample catalog.
5. Register the webhooks: Stripe → `/api/webhooks/stripe`
   (`checkout.session.completed`, `checkout.session.async_payment_succeeded`),
   PayPal → `/api/webhooks/paypal` (`PAYMENT.CAPTURE.COMPLETED`).
6. `vercel.json` schedules a **daily** cron for `/api/cron/abandoned-orders`; it
   authenticates with `CRON_SECRET`.
7. Point an uptime monitor at `/api/health`.
8. Set the real site URL in **Admin → Settings** — canonical URLs, the sitemap
   and emails use it.

---

## Quality checks

```bash
npm run typecheck && npm run lint && npm test
```

All three are expected to be clean (0 errors, 0 warnings). The suite covers
pricing, the payment webhooks and PayPal return, login/MFA/OAuth rules, password
reset, session refresh, stock holds, image hosts, SEO helpers and translations.
Not covered by tests: rendering (no browser tests) and real Stripe/PayPal calls —
verify those manually in test mode before launch.

---

## Notes

- **Product images** aren't uploaded through the app: admins paste an image URL.
  Images from this site, `loremflickr.com` and Vercel Blob are optimized by
  `next/image`; any other host still works but is served unoptimized (so the
  optimizer can't be used as an open proxy). To optimize another host, add it to
  `NEXT_PUBLIC_IMAGE_HOSTS` and rebuild.
- **"Murano glass" is descriptive** of a material and style. The certified
  **Vetro Artistico® Murano** mark is a separate protected designation for glass
  made in authorized Murano furnaces — don't imply certification in product copy
  unless it's true of your supply chain.
- `reports/` is gitignored working space (browser QA log, SEO audit).

---

## What to do next

Ordered by how much they matter for a real launch.

### Before you take real orders

- [x] ~~Never ship the seeded admin login~~ — the seed now uses `SEED_ADMIN_PASSWORD`
      or a generated password, and refuses to run in production. **If you seeded any
      database earlier, run the seed once with `SEED_RESET_ADMIN=1`.**
- [ ] **Set real stock levels.** The QA log records every product at `stockQty: 0`,
      which shows "out of stock" everywhere and marks all products `OutOfStock` in
      structured data.
- [ ] **Run the new migrations** and load translations:
      `npx prisma migrate deploy`, then `npx tsx scripts/apply-product-i18n.ts`.
- [ ] **Configure alerts and shared state:** `SENTRY_DSN`, `UPSTASH_*`,
      `CRON_SECRET`, Turnstile keys.
- [ ] **Real company details** in Admin → Settings (legal name, VAT number,
      address, contact email) — the seed values are placeholders.
- [ ] **VAT decision.** Only Italy has a tax rule, while the site says prices
      include VAT. Add rules for the countries you ship to (or restrict shipping),
      and get an accountant's view on EU OSS.
- [ ] **Test payments end to end in test mode:** card, PayPal, a cancelled-then-
      retried Stripe payment, and a delayed method (SEPA) if enabled.
- [ ] **Have native speakers skim** the translations — especially Hindi,
      Japanese, Arabic and Chinese.
- [ ] **Try the new admin navigation and the password-reset email** in a browser
      (neither could be exercised without a running database).

### High-impact improvements

- [ ] **Locale-prefixed URLs** (`/it/…`, `/de/…`). Today every language shares one
      URL, so search engines only ever see English and the translations can't
      rank; hreflang points at the same URL. This is the biggest SEO lever.
- [ ] **Reinstate-or-refund flow** for payments that arrive after an order was
      cancelled (currently recorded and alerted, then handled by hand), plus a
      `checkout.session.expired` handler.
- [ ] **Review-request email** after delivery — reviews unlock star ratings in
      search results (don't seed fake ones).
- [ ] **Category descriptions** (a `description` column + admin field, translated)
      for on-page SEO copy; a draft is in `reports/seo-audit.md`.
- [ ] **Cache public catalog pages** — every page is currently dynamic because the
      layout reads the session; Cache Components can cache the catalog.
- [ ] **Step-up MFA for Google sign-in** if admins should be able to use Google.

### Later

- [ ] Image uploads (e.g. Vercel Blob) instead of pasting URLs.
- [ ] Localize the transactional emails (they are English only).
- [ ] Browser end-to-end tests for checkout and the admin.
- [ ] A guide/blog hub for informational search terms (how Murano glass is made,
      care, history).
- [ ] Marketing scripts, if any are added, must be gated on the "marketing"
      consent choice the same way analytics is.

Track work in **Admin → Roadmap**, or tick items off here.
