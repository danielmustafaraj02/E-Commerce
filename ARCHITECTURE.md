# Architecture

Perla Murano Glass: a Next.js 16 (App Router) storefront with a local-only
admin, on Prisma 7 / PostgreSQL, deployed to Vercel. This page says where
things live and which rules keep the parts apart. The page builder has its own
document: [docs/builder-architecture.md](docs/builder-architecture.md).

## Public storefront, private admin

The repository holds two applications in one tree:

| | Paths | In Git | In the public build |
|---|---|---|---|
| Storefront | everything else under `src/` | yes | yes |
| Admin, accounts, sign-in | listed in `scripts/private-paths.mjs` (`src/app/admin`, `src/app/account`, `src/app/login`, `src/app/api/admin`, …) | **no** (`.gitignore`) | **no** |

`npm run build` moves the private paths into `.local-only/` before compiling;
`scripts/verify-public-build.mjs` fails the build if a private route or file
appears in the output. In development, `.local-only/tsconfig.json` maps
`@/lib/auth-runtime` and `@/lib/admin-session` to the private implementations
in `.local-only/src/`. See [LOCAL-DEVELOPMENT.md](LOCAL-DEVELOPMENT.md).

Consequences for anyone changing code:

- Storefront code must never import from `src/app/admin` or another private path.
- A private file is not in Git: back it up before large edits.
- Check private code with `npx tsc --noEmit -p .local-only/tsconfig.json`;
  static analysis of `src/` alone does not see what `.local-only/src` imports.

## Directory layout

```
src/
  app/            routes only (pages, layouts, route handlers, server actions)
    api/          route handlers: checkout, webhooks, feeds, cron, …
    admin/        local admin (private)
  components/     React components shared by routes; feature folders where a
                  feature has several (journal/, hero-concepts/)
  lib/            domain logic, data access and pure helpers, one module per
                  concern; i18n/ and journal/ are folders
  content/        hand-written content (journal articles, sources)
  emails/         react-email templates
  auth.ts, proxy.ts, instrumentation.ts
prisma/           schema and migrations (never edited by hand after release)
scripts/          build steps and one-off maintenance scripts
public/           images (WebP, see scripts/optimize-images.mjs), fonts, films
docs/             design notes (builder, audits, roadmap)
```

`src/lib` is flat on purpose: a module per concern (`pricing.ts`,
`place-order.ts`, `section-builder.ts`, …) with its test beside it
(`pricing.test.ts`). Make a folder only when a concern has several modules
(`lib/i18n/`, `lib/journal/`, `lib/hero-concepts/`). Import with the `@/`
alias; there are no barrel files except deliberate re-exports noted in the
module itself.

## Where new code goes

| Adding… | Put it in |
|---|---|
| A page or API endpoint | `src/app/…` (keep it thin: parse, authorise, call `lib/`) |
| Business rules, data access, validation | `src/lib/<concern>.ts` + `<concern>.test.ts` |
| A component used by more than one route | `src/components/` |
| A component used by one route only | next to that route |
| Admin screens | `src/app/admin/…` (private, see above) |
| Translations | `src/lib/i18n/dictionaries.ts` (every locale) |

## Server and client

- Components are Server Components unless the file starts with `"use client"`.
  Keep `"use client"` at the leaves (forms, carousels, toggles).
- Anything a client component imports ends up in visitors' browsers. Keep
  validation libraries and server modules out of that graph:
  - zod schemas live in modules the browser never needs (`gift-card.ts`,
    `gift-voucher.ts`, `checkout-input.ts`, `journal/article-schema.ts`); the
    constants the browser does need are in zod-free modules
    (`gift-card-options.ts`, `gift-voucher-amounts.ts`, `cart-limits.ts`,
    `video-embed.ts`).
  - Modules that read secrets or the database (`db.ts`, `stripe.ts`,
    `paypal.ts`, `email.ts`, `store-settings.ts`) are server-only.
- A client component that only some requests need (the admin live-preview
  bridge) is loaded with `next/dynamic`, not imported statically.

## Database

`src/lib/db.ts` is the single Prisma client (with retries for transient
read errors). Migrations run in `npm run build` through `scripts/migrate.mjs`,
which skips Vercel preview builds because previews share the production
database. Small key/value records (section drafts, block presets, the hero
concepts draft) are rows of `PageLayout` keyed by `target`, not new tables.

## Checkout and payments

The server is authoritative for every amount:

1. `/api/checkout/quote` and `/api/checkout` validate input with
   `lib/checkout-input.ts`, price the cart with `lib/pricing.ts`, and create
   the order in one place, `lib/place-order.ts` (stock, discounts, gift
   vouchers). `/api/checkout/express` does the same for Apple Pay / Google Pay.
2. `/api/checkout/pay/stripe` and `/api/checkout/pay/paypal` start a payment;
   both first call `lib/payable-order.ts` (rate limit, access check, order
   still pending).
3. Only the provider confirms payment: the Stripe and PayPal webhooks (and the
   PayPal return route as a fast path) call `applyPaidToOrder` in
   `lib/order-payment.ts` inside a transaction, then
   `lib/paid-order-emails.ts` outside it.

Never mark an order paid from the browser, and never trust a client amount.

## Page builder

The storefront renders saved designs; the admin edits them.

- `lib/section-builder.ts`: the builder document model, parsing and
  compilation to HTML/CSS (used by storefront and admin).
- `lib/section-templates.ts`: built-in designs (the editor's template list;
  read on the server for the home page's built-in examples, never in a
  browser bundle).
- `lib/section-builder-editing.ts`: editing commands and canvas CSS (admin only).
- `lib/page-layout.ts`, `lib/page-layout-store.ts`: which sections a page has
  and their options; reading the published layout.
- `components/layout-section.tsx`, `builder-view.tsx`, `builder-live.tsx`,
  `builder-runtime.tsx`: storefront rendering.
- `app/admin/settings/page-layout/`: the editor (`section-editor.tsx` workspace,
  `builder-editor.tsx` panel, `block-fields.tsx` content controls,
  `block-look.tsx` appearance controls, `block-catalog.ts` block types,
  `canvas-*.ts` canvas interactions, `section-preview.tsx` preview).

Details and safety rules: [docs/builder-architecture.md](docs/builder-architecture.md).

## Commands

```sh
npm run dev                                        # local dev (restores private routes)
npm test                                           # vitest
npm run lint                                       # eslint
npx tsc --noEmit                                   # types, public config
npx tsc --noEmit -p .local-only/tsconfig.json      # types, including private source
npm run build                                      # public build: migrates the database first
```

`npm run build` runs `prisma migrate deploy` against `DATABASE_URL`. To check
that the public build compiles without migrating, build a clean worktree with
`npx next build` (the worktree has no private files, like the deployment).
