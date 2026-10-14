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

## Checkout

1. `checkout-input.ts` validates the cart; `pricing.ts` calculates current server prices.
2. `place-order.ts` creates the order and reserves stock, discounts and voucher credit.
3. `payable-order.ts` checks access and payment eligibility.
4. Verified provider events call `order-payment.ts`; `paid-order-emails.ts` sends the follow-up emails.

The browser never decides the payable amount or whether payment succeeded. Order cancellation and settlement must coordinate reservation release.

## Visual builder

The local editor produces validated documents; the storefront renders published content. Keep editor code out of visitor bundles. Saved selectors and document formats are compatibility contracts: preserve them when refactoring CSS or modules.

See [builder architecture](docs/builder-architecture.md) for storage and publishing.
