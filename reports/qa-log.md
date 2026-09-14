# QA Log

Automated browser QA passes over the live dev site (http://localhost:3000) using Firefox DevTools MCP. Each pass checks console errors/warnings, network failures, and manual flow-walkthroughs across home, products, PDP, cart, checkout, and admin. New findings only — skip anything already listed below.

---

## Pass 3 — 2026-09-14 (Europe/Rome)

### 🔵 Root cause identified (not patched) — "blank /account page after registering while signed in as a different user" (Pass 1)

Per AGENTS.md's instruction to check this Next.js version's actual behavior rather than assume from training data, read `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` and `authentication-with-cache-components.md` first. Per those docs, a Server Action that calls `redirect()` after mutating cookies should stream the **destination's** freshly-rendered RSC payload in the same roundtrip, using the already-updated cookie state — so in principle this should just work, and the bug isn't a general Next.js router-cache staleness issue as originally suspected.

Traced it instead to the installed `next-auth@5.0.0-beta.32` source (`node_modules/next-auth/src/lib/actions.ts`, `signIn()`, lines 18 & 71): it builds its **internal** Auth.js sub-request from `new Headers(await nextHeaders())` — the raw incoming request headers, which still carry whatever `Cookie` header the browser sent with *this* request. When `/register`'s form is submitted while already signed in as a different user (e.g. admin), that stale, different-identity session cookie is present on the request and gets forwarded into Auth.js's own internal credentials-callback dispatch alongside the new user's credentials.

**Not patched**, because:
- This is upstream `next-auth` (still in beta) App-Router-action behavior, not application code — the public `signIn()` API in this version doesn't expose a way to override which headers its internal sub-request forwards.
- A workaround (e.g. calling `signOut()` immediately before `signIn()` in the register action) would **not** actually fix it: `headers()` returns an immutable snapshot of the original incoming request headers, unaffected by an earlier `cookies().set()`/`delete()` call in the same action — so the stale `Cookie` header would still be there when `signIn()` runs.
- The already-confirmed real customer path (registering while signed out, the actual first-time-visitor flow) works perfectly every time. This only reproduces for an already-authenticated user re-registering a second account through the public form — not a realistic customer journey.
- Auth-critical code is exactly where a low-confidence speculative fix is most likely to introduce a worse problem than the one it solves.

**Recommendation if this needs to be eliminated rather than just understood:** either (a) upgrade `next-auth` once a stable v5 release addresses this (check its changelog for App Router action header-forwarding fixes), or (b) as a defensive UI-level mitigation, disable/hide the public `/register` form (or force a sign-out redirect first) when `auth()` already returns a session, closing off the trigger condition entirely rather than fixing the underlying library behavior.

### Security review findings (fixed)

Reviewed every admin Server Action (confirmed each starts with `requireStaff()`/`requireAdmin()` — none missing), both payment webhook handlers (signature verification before any processing, idempotent on `order.status !== "pending"`), and account export/delete (correctly scoped to `session.user.id`, never a client-supplied id). Two real findings, both fixed:

- 🔴 **Stored XSS via JSON-LD injection** — `JSON.stringify()` doesn't escape `<`, so any admin-editable field (product name/description, `StoreSettings.storeName`/`contactEmail`) containing a literal `</script>` would break out of the `<script type="application/ld+json">` tag it's injected into via `dangerouslySetInnerHTML` (`src/app/layout.tsx`, `src/app/products/[slug]/page.tsx`) and inject executable script for every visitor. Fixed with a new `toSafeJsonLd()` helper (`src/lib/json-ld.ts`, escapes `<`/`>` plus the two JS line-terminator code points) used at both sites, with unit tests (`src/lib/json-ld.test.ts`).
- 🟠 **Guest order lookup: low entropy + no rate limiting** — a guest (no account) order's `orderNumber` is its only access token (`src/lib/orders.ts`'s `canAccessOrder` grants access to anyone who has it), but it only had 32 bits of randomness (`randomBytes(4)`) and `/order-confirmation/[orderNumber]` had no rate limiting at all, unlike every other sensitive endpoint in the app — an enumerable path to other customers' name/address/order contents. Fixed: bumped to 64 bits (`randomBytes(8)`, `src/app/api/checkout/route.ts`) and added the same per-IP `rateLimit()` used elsewhere (30 lookups/min) to the order-confirmation page.

Verified: `npm run typecheck` / `lint` / `test` (31/31, incl. 4 new) all green, plus an HTTP smoke pass confirming JSON-LD still renders correctly for real store/product data and a bogus order number is still correctly rejected.

---

## Pass 2 — 2026-09-14 14:37 (Europe/Rome)

Scope: local dev server startup diagnosis, the three items left open at the end of Pass 1, and a source-level re-audit of `docs/specs/murano-storefront-improvement-prompt.md` against actual code (that checklist had drifted stale — see that file's own changelog note).

### 🔴 Root cause found & fixed — dev server looked "Ready" but never answered requests
- **Where:** local dev environment only (not a code bug)
- **Detail:** `npm run dev` printed `✓ Ready` and then the process panicked and died: Turbopack's persistent dev filesystem cache (`.next/dev/cache/turbopack/`, on by default since Next 16.1) had a `.meta` file referencing a missing `.sst` file — `Failed to restore data for task TaskId 1`. Root cause is corruption from an unclean previous shutdown (killed process, crashed terminal), not anything in this codebase.
- **Fix:** `rm -rf .next && npm run dev`. Reproduced clean afterward: `✓ Ready in 1376ms`, `/`, `/products`, `/api/health` → 200, `/admin` → 307 (correct unauthenticated redirect).
- Documented for next time in `docs/LOCAL_DEV.md`.

### Pass 1 follow-ups — all three now addressed
1. **LCP image not eager-loaded** — already fixed by the time of this pass: `src/app/page.tsx` hero has `priority`, and `src/components/product-image-zoom.tsx`'s PDP image has `priority` too. No change needed, just confirming closed.
2. **Admin pages lack a `<main>` landmark** — fixed: `src/app/admin/layout.tsx` now wraps its content area in `<main>` instead of a plain `<div>`.
3. **Shipping-is-€0 messaging** — fixed: `quoteOrder()` (`src/lib/pricing.ts`) already computed a `freeShipping` boolean but never returned it. Now threaded through `/api/checkout/quote` → `CheckoutClient` → a green "You qualify for free shipping!" line (`dict.freeShippingApplied`, EN+IT) shown under the shipping row whenever it applies.

Verified with `npm run typecheck` / `npm run lint` / `npm test` (27/27 passing) after each change, plus an HTTP smoke pass (`/`, `/admin`, `/products`, `/about`, `/checkout` all 200/307 as expected, zero errors in the dev server log).

### Still open
- **VAT/IVA gap** (Pass 1) — unchanged, still a business decision (add non-IT tax rules, or restrict checkout to Italy-only), not a code fix.
- **Blank page re-registering while already signed in as a different user** (Pass 1) — narrow edge case, not re-tested this pass; still believed low priority.

### Not re-verified this pass (no Firefox MCP session available yet)
`.mcp.json` (Firefox DevTools MCP via `@mozilla/firefox-devtools-mcp`) was added to the project this session but a newly-added MCP server only loads on a fresh Claude Code session start — it wasn't available mid-session to drive an actual browser pass here. Everything above was verified via source inspection + HTTP requests instead. **Next actual Firefox-driven pass should start a fresh session** (see `docs/QA_BROWSER_TESTING.md`) to get real console/network/visual coverage, especially for the two remaining open items above and a visual check of the new free-shipping message styling.

---

## Pass 1 — 2026-09-14 12:52 (Europe/Rome)

Scope: home, products, product detail, cart, checkout (guest + logged-in), admin login, admin dashboard, tax rules, shipping config, team/roles, register/login/logout, staff-role permission boundaries.

### 🟡 Not a bug (false positive, corrected after code review) — "Shipping stays 0,00 € regardless of method"
- **Where:** `/checkout`
- Originally flagged after selecting Express/Standard shipping produced no change to the "Shipping" or "Total" line. Root cause, found in `src/lib/pricing.ts:111-114`: `StoreSettings.freeShippingThreshold` is seeded at 5000 (€50, `prisma/seed.ts:21`), and the test cart (51,67 € / 103,34 €) was above it — so `shippingAmount` is correctly waived to 0 regardless of the method chosen. Confirmed by `src/lib/pricing.test.ts` ("waives shipping once the free-shipping threshold is met") and by re-reading the pricing logic; not reproduced as a defect.
- **Real, smaller UX gap:** the order summary gives no indication *why* shipping shows 0,00 € (no "You qualify for free shipping" message) — a real customer could reasonably mistake this for the same bug. Consider surfacing `quote.shippingAmount === 0 && subtotal >= threshold` as a positive message rather than a bare zero.

### 🟠 Medium — No VAT/IVA charged for non-Italian destinations (checkout defaults to DE)
- **Where:** `/checkout`, confirmed via Admin → Tax rules
- **Detail:** Only one tax rule exists ("IVA standard", IT, 22%, all categories). Checkout's country selector defaults to "DE". With DE selected, the order summary shows "Includes VAT/IVA: 0,00 €" and an inline notice: *"No tax rate is configured for this destination — 0% was applied to the affected items. Cross-border EU sales may be subject to VAT/OSS rules; consult an accountant."*
- **Conflict:** The homepage explicitly states "All prices shown include VAT/IVA," which is false for any non-IT destination under current config.
- **Impact:** Likely a data/config gap rather than a code bug, but worth flagging — real orders from outside Italy would currently ship with 0% tax applied.

### 🟢 Low — Blank page after registering *while already signed in as a different user*
- **Where:** `/register` → submit
- **Repro:** While authenticated as `admin`, navigate to `/register`, fill in a new account, submit. The resulting page (post sign-in-as-new-user redirect to `/account`) renders only header + footer, no `<main>`, no content.
- **Re-tested while logged out** (the real first-time-visitor path): registration → redirect to `/account` renders perfectly every time, fully populated, no issues.
- **Conclusion:** Narrow edge case — an already-authenticated session (likely a stale Next.js router-cache entry for `/account` fetched under the old session) registering a *second* account through the public form. Not a real customer-facing bug; low priority to chase further.

### 🟢 Low — LCP image not eager-loaded
- **Where:** Home page and product pages (e.g. `bracciale-bolle-di-cielo-bee6fa.jpeg`)
- **Detail:** Next.js dev console warning: image detected as Largest Contentful Paint but not marked `loading="eager"`/`priority`, hurting perceived load performance for the above-the-fold hero/product image.

### 🟢 Low — Admin pages lack a `<main>` landmark
- **Where:** All `/admin/*` pages
- **Detail:** Storefront pages wrap content in `<main>`; admin pages use a plain `<div>` instead. Minor a11y/consistency nit, not a functional bug.

### ✅ Verified working
- Home, Products (filters/price range UI), Product detail, Cart (add/update/remove), guest checkout form rendering, admin login/logout, admin dashboard data, Tax rules and Shipping config screens all load cleanly with **zero console errors** and **zero failed network requests**.
- **Staff role permissions correctly enforced:** created a test account, granted it "Staff" via Admin → Team, confirmed staff can reach `/admin/products` (and by nav visibility: categories, suppliers, orders, customers, newsletter, discounts, returns, shipping, tax rules) but `/admin/payments` correctly returns a 404 (not a raw 403/leak) for the staff account, matching the documented staff-vs-admin boundary ("Staff can manage products, orders, shipping, and discounts, but not payments, integrations, or other people's access").

---

## Follow-up fixes applied this session (same day, after Pass 1)

Beyond logging findings, the following were fixed/implemented directly (typecheck + lint + full test suite green after each):

1. **🔴 Real bug fixed — filters silently discarded on every submit.** `src/app/products/page.tsx`: the filter form's hidden `q` field and the category `<select>`'s default `""` value always submit as empty strings, but the Zod schema used `.min(1)` on those fields — an empty string fails validation, so `safeParse` failed and **the entire filter set silently reset to defaults on every "Apply filters" click**, regardless of what was actually selected (category, price range, in-stock). Fixed by treating `""` as "not provided" before validation. Confirmed via network request inspection + re-test.
2. **Feature added — filters on category pages.** `/category/[slug]` previously had no filtering at all. Extracted the filter sidebar into a shared `ProductFilterPanel` component (`src/components/product-filter-panel.tsx`) and pagination into `src/components/pagination.tsx`, used by both `/products` and `/category/[slug]` now — same price-range/in-stock filtering and pagination in both places.
3. **UX — filters panel is now collapsed by default** (`<details>`-based disclosure, no JS required), auto-opens when a filter is already active. Fixes both "too much clutter above the fold on mobile" and "I want filters to open only if I want."
4. **UX — pagination page numbers restyled** as bordered pill buttons with a filled active state (`src/components/pagination.tsx`), replacing plain text links.
5. **UX — cart quantity control replaced.** Native `<input type="number">` (browser spinner arrows) swapped for a `− 1 +` stepper (`src/components/quantity-stepper.tsx`) in `src/app/cart/cart-client.tsx`.
6. **Footer expanded** (`src/components/footer.tsx`): was a single newsletter row + copyright line; now a 4-column footer (brand/social, Shop links incl. live categories, Help/legal links, Company + newsletter), fully responsive (stacks to 1 column on mobile, verified at 390px).
7. **Klarna "we accept" badge wired up.** `settings.klarnaEnabled` existed in the DB/admin toggle but was never rendered anywhere; added a self-drawn `KlarnaIcon` to `payment-icons.tsx` and threaded `klarna` through `Footer`/`layout.tsx`. (Declined the literal ask to pull real Visa/Mastercard/PayPal/Klarna logos from the internet — this app deliberately avoids third-party/trademarked image assets for the checkout-adjacent CSP and licensing reasons documented at the top of `payment-icons.tsx`; used the same self-drawn-badge convention instead.)
8. **All 50 products set to `stockQty: 0`** per request, ahead of going live (site-wide "Out of stock" now shows correctly everywhere it should — home, category, product listing, PDP).
9. **README overhauled:** clearer "Getting started" with the actual seeded admin login spelled out, and a new step-by-step "Going live on Vercel" section (env vars, migration step, seeding production, custom domain + `Site URL` gotcha for SEO metadata).

### Still open / not fixed (judgment calls, not code bugs)
- **VAT/IVA gap (Pass 1 finding above)** — needs a real business decision (add tax rules for other destination countries, or restrict checkout to Italy-only) rather than a code fix.
- **LCP image `priority` warning** and **admin `<main>` landmark** — both minor, not yet applied.
- **Shipping-is-€0 messaging** — works correctly (free-shipping-over-€50 threshold) but doesn't explain itself to the customer; a "You qualify for free shipping" message would remove the ambiguity.
