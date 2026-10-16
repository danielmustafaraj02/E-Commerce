# Architecture

Next.js App Router and React, with Prisma/PostgreSQL, Stripe and PayPal payments, Resend email and Vercel hosting. Installed versions are in `package.json`.

## Where things live

| Folder            | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `src/app/`        | Pages, layouts, API routes and server actions               |
| `src/components/` | Shared UI; route-specific UI stays beside its route         |
| `src/lib/`        | Business rules, queries and helpers, with tests beside them |
| `src/content/`    | Editorial content and sources                               |
| `src/emails/`     | Email templates                                             |
| `prisma/`         | Schema and database migrations                              |
| `scripts/`        | Development, build and maintenance tools                    |
| `public/`         | Shipped photos, fonts and video                             |
| `docs/`           | Builder guide, roadmap and performance notes                |

Keep routes small: validate input, check permission and call a shared helper. Create a feature folder when several modules belong together; avoid moving the whole project just for consistency.

## Public and private code

Admin, accounts and authentication routes are local-only. Their paths are listed in `scripts/private-paths.mjs`. Builds move them into `.local-only/`; `scripts/verify-public-build.mjs` checks that they did not ship.

Public code must not import private admin code. Private source needs a separate backup and the private TypeScript check. See [local development](LOCAL-DEVELOPMENT.md).

## Server and browser

Use Server Components by default. Add `"use client"` for interactions such as forms and carousels. Browser imports must not pull in database clients, secrets or validation modules that the UI does not need.

Use `src/lib/db.ts` for database access. Do not share-cache sessions, payments, checkout quotes or customer data. Keep cache invalidation with the operation that changes the underlying content.

## Routes, rendering and caching

The storefront lives under `src/app/[locale]/` (`/it/…`, `/en/…`); its root layout reads nothing from the request, and `getLocale()` reads the language from the URL (`next/root-params`). The admin is a separate root layout at `src/app/admin/`, without a language. Both render `SiteDocument` (`src/components/site-document.tsx`).

Catalog pages are cached and served to everyone: the home page, products, articles, looks, about and legal pages are prerendered or rendered on first visit, then rebuilt every 5 minutes at most and immediately after an admin edit (`src/lib/cache-tags.ts`, `revalidatePath` in the admin actions). To keep them cacheable, they must not read cookies, headers, the session or search parameters. Visitor-specific parts (account links, wishlist, review form) load in the browser from `/api/viewer`.

Pages that handle a visitor's own data or a payment (cart, checkout, account, login, order confirmation…) render per request. They are listed in `STRICT_CSP_PATH` in `src/proxy.ts` and marked `export const dynamic = "force-dynamic"`; they get the strict CSP with a per-request nonce. Cached pages cannot carry a nonce, so they get a CSP that allows inline scripts. A page added to the strict list must be dynamic, or its cached copy is blocked. Listing pages with filters read search parameters and also render per request.

Do not put a `loading.tsx` above a page that can be a 404: it starts the response with status 200 before the page decides.

## Checkout

1. `checkout-input.ts` validates the cart; `pricing.ts` calculates current server prices.
2. `place-order.ts` creates the order and reserves stock, discounts and voucher credit.
3. `payable-order.ts` checks access and payment eligibility.
4. Verified provider events call `order-payment.ts`; `paid-order-emails.ts` sends the follow-up emails.

The browser never decides the payable amount or whether payment succeeded. Order cancellation and settlement must coordinate reservation release.

## Page design

Page layouts, colours, fonts and block styles are code in `src/design/`; the admin has no design tools. Layout documents and their CSS selectors are compatibility contracts: preserve them when refactoring CSS or modules.

See [page design](docs/builder-architecture.md).
