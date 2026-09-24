# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` is rewritten by `next dev`; don't edit it. This is Next.js 16 with React 19 — APIs differ from older versions, so read the relevant guide in `node_modules/next/dist/docs/` before writing framework code. `README.md` covers setup, the env-var table and deploy steps; it isn't repeated here.

## Commands

```bash
npm run dev                 # needs Postgres at DATABASE_URL (no docker/local DB is provided)
npm run typecheck           # tsc --noEmit
npm run lint                # eslint — kept at 0 errors / 0 warnings
npm test                    # vitest run (src/**/*.test.ts and scripts/**/*.test.ts)
npx vitest run src/lib/pricing.test.ts            # one file
npx vitest run -t "waives shipping"               # one test by name
npx next typegen            # regenerate PageProps<"/route"> types after adding a route, or tsc fails
npx prisma generate         # after any schema.prisma change (also runs on npm install)
```

- Test files sit next to the code they cover and use the `@/` alias (= `src/`). Route handlers and server actions are tested by importing `GET`/`POST`/the action directly, mocking `@/lib/db` and friends with `vi.hoisted` + `vi.mock`.
- `build` is `node scripts/migrate.mjs && next build`: `prisma migrate deploy`, skipped on Vercel preview deployments (their `DATABASE_URL` is the live database; set `MIGRATE_PREVIEWS=1` once previews have their own). **Pushing to `main` deploys to production (https://perlamuranoglass.com) and applies pending migrations to the live database.** A preview of a PR that adds columns can fail until it's merged.
- Migrations are hand-written SQL in `prisma/migrations/`. Generate the SQL without a database: `npx prisma migrate diff --from-schema <old.prisma> --to-schema prisma/schema.prisma --script`. Don't run `prisma format` on the whole schema (it reflows unrelated lines).
- Never run `db:seed` against a production `DATABASE_URL`: it creates demo data (it refuses `NODE_ENV=production`). It needs `SEED_ADMIN_PASSWORD` or prints a generated one; there is no default password.
- Catalog scripts: `npx tsx scripts/<name>.ts --dry-run` first. All read `scripts/murano-manifest.json`.
- The shell is zsh: quote globs (`--include='*.ts'`), or they error instead of expanding.
- Several files are not Prettier-clean at HEAD (`layout.tsx`, `page.tsx`, `dictionaries.ts`, `login-form.tsx`, the category page, `admin/page.tsx`), so `format:check` reports them. Only format files you touch that were clean; don't reformat wholesale.

## Architecture

**Request gate vs. authorization.** `src/proxy.ts` (Next 16's replacement for middleware) sets the per-request CSP nonce, redirects signed-out users away from `/admin`/`/account`, and forces admin/staff into MFA enrollment. It reads the raw JWT (`getToken`, no DB), excludes `/api`, and **does not run for Server Actions**. So every admin mutation must call `requireStaff()`/`requireAdmin()` (`src/lib/require-admin.ts`) itself. Settings, payments, integrations, team and legal pages are admin-only; staff get the rest.

**Sessions are JWTs re-validated against the DB.** `src/auth.ts` builds its config asynchronously (Google can be toggled from Admin > Settings). Its `jwt` callback re-reads the user on every session read via `lib/session-refresh.ts`, so demotion, deletion and password reset take effect immediately (`User.passwordChangedAt` vs the token's `authAt`). The MFA login is two steps in `app/login/actions.ts`; the second step waives the captcha only with a signed cookie from `lib/login-proof.ts`. Google sign-in is refused for MFA/admin/staff accounts (`lib/oauth-policy.ts`). Password reset stores only a SHA-256 of the token in `VerificationToken` (`lib/password-reset.ts`).

**Settings live in the DB and override env.** `getStoreSettings()` (`lib/store-settings.ts`, one `StoreSettings` row, cached per request) holds Stripe/PayPal/Resend/Turnstile/Upstash/Google credentials, site URL, tax/shipping options. Integration code follows `settings.x || process.env.X`. Absolute URLs (canonicals, sitemap, emails) come from `settings.siteUrl`.

**Money and orders.** Amounts are integer cents. `lib/pricing.ts#quoteOrder` is the single source of checkout math (used by the quote and order routes); client prices are never trusted. `POST /api/checkout` creates a `pending` order and decrements stock in one transaction; `api/checkout/pay/{stripe,paypal,bank-transfer,cash-on-delivery}` then start payment. **Webhooks are the source of truth for "paid"**: both go through `lib/order-payment.ts#applyPaidToOrder`, which checks amount/currency and reports money arriving for a cancelled order for manual review (outcomes, not exceptions, so providers don't retry). The PayPal return route only pays the order tied to that PayPal order's `Payment` row.

**Stock reservation.** `lib/abandoned-orders.ts#cancelExpiredOrders` releases stock for unpaid orders (2h card/PayPal, 5 days bank transfer). Each order is claimed with a status-guarded update so the daily cron and checkout (which releases on demand when it hits out-of-stock) can't double-restock.

**i18n on a single URL.** 11 locales; language comes from a cookie / `Accept-Language`, not the path. UI text is `lib/i18n/dictionaries.ts` (each locale is typed as `Dictionary = typeof en`; `dictionaries.test.ts` also checks placeholders, script mixing, pt-PT (not Brazilian), formal German). Catalog text is columns like `nameFr`/`descriptionJa` on `Product`/`Category` with fallback locale → English → Italian (`lib/product-i18n.ts`); Italian is the source language. `scripts/i18n-fields.ts` is the one list of locale suffixes. The consequence for SEO is that crawlers only see English.

**SEO metadata gotcha.** Next merges metadata shallowly and inherits unset fields, so **the root layout must not set `alternates`/canonical** — every child without its own would inherit it (this caused wrong canonicals on `/contact` and `/legal/*`). Private/utility routes get `noIndexMetadata` from small `layout.tsx` files. JSON-LD helpers: `lib/json-ld.ts` (`toSafeJsonLd`, `absoluteUrl`), `lib/offer-json-ld.ts` (shipping/returns derived from the same zones checkout prices from).

**Other cross-cutting pieces.**
- Admin nav is a pure model in `lib/admin-nav.ts` (top bar of sections, sidebar per section) rendered by `components/admin-nav.tsx`; new admin pages must be added there.
- Analytics loads only after cookie consent (`components/consent-gated-analytics.tsx`, `lib/consent.ts`).
- Images from admin-controlled URLs go through `CatalogImage`; `next.config.ts` allows only hosts in `lib/image-hosts.ts` (extend with `NEXT_PUBLIC_IMAGE_HOSTS`) — never restore `hostname: "**"`.
- Admin > Roadmap is an in-app to-do list (`ImprovementTask`); `lib/launch-checklist.ts` is a 100-item checklist that an admin imports into it.
- `.env*` is gitignored except `.env.example`; `reports/` (QA log, SEO audit) is gitignored local working space.
