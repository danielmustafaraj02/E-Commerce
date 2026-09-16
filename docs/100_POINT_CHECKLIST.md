# 100-point checklist — secure, reliable, fast, profitable

A single ordered reference for the four things that actually matter once a store is live: it can't be broken into, it doesn't fall over, it's fast, and it makes money. Grounded in *this* codebase and its current state (cross-checked against [README.md](../README.md)'s status table and [reports/qa-log.md](../reports/qa-log.md)) as of 2026-09-16, not a generic checklist — every item either names the specific file/env var/feature involved or the specific gap found during QA. ✅ = already done, ⬜ = not done yet. Re-verify ✅ items periodically; they reflect the codebase at the time this list was written, not a permanent guarantee.

Work top to bottom within each section — earlier items block or de-risk later ones.

---

## Security (25)

1. ⬜ Rotate the seeded admin password (`admin@demo-store.example` / `ChangeMe123!`) — it's public in this repo's own README and currently works against production. Single most urgent item in this entire list.
2. ⬜ Change the seeded admin's email away from the public `admin@demo-store.example` once logged in with the new password.
3. ⬜ Enable TOTP MFA on every admin/staff account (already built — Account → Security) — don't leave it optional for privileged roles.
4. ⬜ Set `TURNSTILE_*` env vars so bot-protection actually activates on signup/contact/checkout — currently dormant (skipped, not broken) without them.
5. ⬜ Set `UPSTASH_REDIS_*` so rate limiting survives redeploys and works across serverless instances — `src/lib/rate-limit.ts` currently falls back to a single-instance in-memory limiter.
6. ✅ CSP (per-request nonce) + HSTS + baseline security headers already live (`next.config.ts`, `proxy.ts`).
7. ✅ Stored-XSS via JSON-LD injection fixed (`toSafeJsonLd()`, `src/lib/json-ld.ts`, unit-tested).
8. ✅ Guest order-lookup token hardened to 64 bits (`randomBytes(8)`) plus rate-limited (QA Pass 3).
9. ⬜ Audit git history to confirm no real secret was ever committed alongside the (intentionally public, seed-only) demo password.
10. ⬜ Add automated dependency vulnerability scanning — no `.github/workflows` exist yet in this repo; wire up Dependabot or `npm audit --audit-level=high` in CI.
11. ⬜ Publish a `security.txt` / responsible-disclosure contact for anyone who finds a bug.
12. ⬜ Confirm Stripe/PayPal webhook secrets are set in production and signature verification has been tested against a real webhook event, not just reviewed in code.
13. ⬜ Set `SENTRY_DSN` — `src/lib/monitoring.ts` is already wired to Sentry, it just has nothing to report to today, so errors only reach console/host logs with no alerting.
14. ⬜ Add password-strength/breach checking at registration (e.g. HaveIBeenPwned range API) beyond basic validation.
15. ⬜ Log and alert on login anomalies (new device/IP for admin accounts) beyond the existing lockout mechanism.
16. ⬜ Confirm the existing admin audit log is actually reviewed/alerted on somewhere, not just written and forgotten.
17. ⬜ Double-check `.env*` files are gitignored and re-scan history for any accidentally committed real credentials.
18. ⬜ Require MFA unconditionally for every admin/staff role rather than leaving it opt-in.
19. ⬜ Add a CSP `report-to`/`report-uri` endpoint so violations in production surface instead of silently failing closed.
20. ⬜ Run the `/security-review` skill before every release that touches auth, payments, or admin code.
21. ⬜ Exercise the GDPR export/delete account flows against a real request end-to-end, not just via code review.
22. ⬜ Re-check rate-limit coverage every time a new API route is added — QA found one endpoint missing it (`order-confirmation`) that's since been fixed; don't let a new one slip through the same way.
23. ⬜ Put a calendar reminder on secret rotation: `AUTH_SECRET`, `CRON_SECRET`, Stripe/PayPal keys.
24. ⬜ Confirm production Postgres (Neon) enforces SSL-only connections and, if available, IP allowlisting.
25. ⬜ Put Vercel's or Cloudflare's DDoS/WAF layer in front before actively advertising the site to real traffic.

## Reliability (25)

26. ⬜ Add CI (GitHub Actions) running `lint` + `typecheck` + `test` on every PR — confirmed no `.github/workflows` exist in this repo today.
27. ⬜ Add an automated post-deploy smoke test hitting `/`, `/api/health`, `/admin` (expect redirect), and a checkout page load.
28. ⬜ Set up uptime monitoring/alerting against `/api/health` (Vercel's own, or an external pinger).
29. ✅ `/api/health` endpoint exists and returns 200 in production today.
30. ⬜ Confirm Neon's backup/point-in-time-recovery window is known and a restore has actually been *tested*, not just assumed to work.
31. ⬜ Write down and rehearse a rollback procedure (`vercel rollback` or redeploying the prior build) before you need it under pressure.
32. ⬜ Once `SENTRY_DSN` is set (Security #13), confirm alerts actually reach a human, not just a dashboard nobody watches.
33. ⬜ Treat `npx prisma migrate deploy` as a required release gate against production — never `prisma db push` there.
34. ⬜ Stand up a staging environment separate from production for testing schema migrations and webhook changes before real customers see them.
35. ⬜ Load-test the checkout and product-listing endpoints before any marketing push, so you know real capacity instead of guessing.
36. ⬜ Verify the Vercel Cron job for abandoned orders (`vercel.json`, `/api/cron/abandoned-orders`) is actually firing in production logs, not just configured.
37. ⬜ Add double-submit protection on the checkout button, on top of the existing webhook idempotency, so a slow network + impatient click can't double-charge.
38. ⬜ Pipe logs somewhere with retention longer than Vercel's default window if you need history for incident review.
39. ⬜ Stand up even a minimal public status page for customers to check during an incident.
40. ⬜ Schedule a recurring `npm outdated` review — `next-auth` is still on a beta (`5.0.0-beta.32`); track its stable release and changelog for the App-Router header-forwarding bug already documented in `reports/qa-log.md` Pass 3.
41. ⬜ Confirm Prisma's connection pool size (via `@prisma/adapter-pg`) is tuned for Vercel's serverless concurrency model, not a fixed-server default.
42. ⬜ Deliberately test what happens when Stripe, PayPal, Resend, Upstash, or Turnstile time out or go down — confirm graceful degradation, not a hard 500.
43. ⬜ Add retry/backoff around outbound calls to Stripe/PayPal/Resend rather than a single attempt.
44. ⬜ Confirm the current all-products-`stockQty:0` state (set deliberately pre-launch per the README) gets *un*-set on purpose before go-live, and add a low-stock alert to admins for after.
45. ⬜ Add a schema-diff review step before every `migrate deploy`, so a destructive column drop doesn't reach production by accident.
46. ⬜ Reconsider the admin-pasted arbitrary image URL approach (no upload pipeline today) as a single point of failure — a dead third-party host breaks product photos with no local fallback.
47. ⬜ Extend the 31-test suite to explicitly cover the abandoned-order cron path (reminder email, auto-cancel, stock release).
48. ⬜ Write and store a "Postgres provider outage" runbook before you need it at 2am.
49. ⬜ Double check `NEXTAUTH_URL` / Admin → Settings → Site URL match the real environment in staging vs. production — mismatches break auth callbacks and SEO metadata (README already flags this as a step-8 gotcha).
50. ⬜ Add a pre-deploy checklist gate (required env vars present, migrations applied, health check green) before promoting a build to production.

## Performance (25)

51. ✅ Hero and PDP LCP images already use `priority` (`src/app/page.tsx`, `src/components/product-image-zoom.tsx`).
52. ⬜ Run Lighthouse/PageSpeed Insights against the actual production URL, not just localhost, and fix whatever it flags.
53. ✅ `@vercel/speed-insights` is installed — confirm in the Vercel dashboard that it's actually receiving field data, not just present in `package.json`.
54. ⬜ Audit every `<Image>` for a correct `sizes` attribute as new components are added — `category-carousel.tsx` and `product-card.tsx` already do this right; keep the discipline going forward.
55. ⬜ Move product/category imagery off loremflickr placeholders and arbitrary hotlinked admin URLs onto a real image CDN (Cloudinary, imgix, or Vercel's own image optimization with a proper origin).
56. ⬜ Add database indexes matched to real production query patterns (category filter, price range, order lookup) and confirm with `EXPLAIN ANALYZE` — the current 50-product seed catalog is too small to reveal a missing index.
57. ⬜ Turn on Prisma query logging in staging at least once to catch any N+1 pattern before it reaches production traffic.
58. ⬜ Set explicit cache-control / ISR revalidation windows on category and product pages instead of leaving everything fully dynamic by default.
59. ⬜ Bundle-analyze the client JS (Swiper, Zustand, Radix UI) and confirm nothing loads on a page that doesn't need it.
60. ⬜ Watch for a production analogue of the documented Turbopack dev-cache crash (`docs/LOCAL_DEV.md`) — it's a dev-only issue today, confirm it stays that way.
61. ⬜ Confirm no route accidentally sends `Cache-Control: no-store` on genuinely static assets.
62. ⬜ Confirm the Geist font files are subset/preloaded efficiently rather than shipping unused glyph ranges.
63. ⬜ Spot-check the checkout page specifically for CSP-blocked-resource console errors, since its CSP is deliberately the strictest in the app.
64. ⬜ Consider a Redis-backed cache (Upstash is already a dependency once Security #5 is done) for expensive, frequently-hit reads like the homepage best-sellers query.
65. ⬜ Confirm every homepage carousel is dynamically imported the way `CategoryCarousel` already is in `src/app/page.tsx` (`next/dynamic`), so Swiper's JS doesn't block first paint anywhere it's used.
66. ⬜ Load-test with a production-scale product count — current seed data is 50 products, real catalogs may be an order of magnitude larger.
67. ⬜ Set explicit `revalidate`/`dynamic` route segment config per page instead of relying on Next.js's default inference.
68. ⬜ Check actual file sizes under `public/products/**` and compress/re-encode anything oversized for its display size.
69. ⬜ Review Core Web Vitals in Speed Insights monthly once there's real traffic, not just once at launch.
70. ⬜ Confirm the Neon database region matches the Vercel deployment region to minimize time-to-first-byte.
71. ⬜ As more entrance/hover animations get added (like the `category-carousel.tsx` one done 2026-09-16), keep every keyframe opacity/transform-only per the existing convention in `globals.css` — that's what keeps them cheap to composite and safe under `prefers-reduced-motion`.
72. ⬜ Reach for `will-change` only where real profiling shows jank, never pre-emptively across the board.
73. ⬜ Test the site on a throttled/mobile network profile, not only a fast dev-machine connection.
74. ⬜ If any caching layer (service worker, CDN, ISR) gets added later, verify it can never serve stale price or stock data after an admin edit.
75. ⬜ Add a performance budget (e.g. Lighthouse CI) that fails a PR when bundle size regresses past a threshold.

## Profitability (25)

76. ⬜ Set `STRIPE_*`/`PAYPAL_*` in production — checkout cannot take a real payment without them today (confirmed in README's current-status table).
77. ⬜ Set `RESEND_API_KEY`/`EMAIL_FROM` — order confirmations, abandoned-cart reminders, and password-related email don't send without them.
78. ⬜ Resolve the VAT/IVA gap flagged in `reports/qa-log.md` Pass 1: only one Italian tax rule exists today, so non-IT destinations checkout at 0% tax while the homepage claims "all prices include VAT/IVA" — decide OSS registration for cross-border EU sales vs. restricting checkout to Italy-only.
79. ⬜ Register a real business entity (partita IVA or equivalent) — required by Stripe/PayPal to leave test mode.
80. ⬜ Point a real custom domain at the deployment — it's only reachable on `*.vercel.app` today, which visibly reads as unfinished to a real customer.
81. ⬜ Update the stale `StoreSettings.storeName` directly in the production database — the seed default changed in code but `db:seed`'s upsert doesn't touch an existing row.
82. ⬜ Once Resend is configured (item 77), confirm the existing abandoned-cart cron job is actually recovering sales, and tune `ABANDONED_ORDER_REMINDER_HOURS`/`ABANDONED_ORDER_EXPIRE_HOURS` against real behavior instead of the defaults.
83. ⬜ Configure conversion-event tracking in Vercel Analytics (add-to-cart, checkout-start, purchase) — the package is installed but goal tracking isn't automatic.
84. ⬜ Once there's real traffic, A/B test homepage hero copy/CTA rather than assuming "Shop now" is optimal forever.
85. ⬜ Surface aggregate star ratings on category/listing pages, not only the product detail page — verified-purchase reviews already exist, just underused.
86. ⬜ Build gift-guide/occasion landing pages using `Category.parentId`, which already supports this hierarchy in the schema but sits unused (flagged in `docs/specs/murano-storefront-improvement-prompt.md`).
87. ⬜ Add multiple photo angles per product — today's catalog is one photo per item, which likely suppresses conversion and raises returns versus the multi-angle competitor standard already documented in the improvement spec.
88. ⬜ Add an exit-intent or post-purchase email capture/upsell flow beyond the current newsletter signup.
89. ⬜ Confirm Klarna is actually toggled on in `StoreSettings` if buy-now-pay-later lifts average order value for this catalog's price points — the footer badge (`payment-icons.tsx`) is already wired, just gated by the setting.
90. ⬜ Wire up retargeting pixels (Meta/Google) gated through the existing `ConsentLog`/cookie-banner consent system, so remarketing doesn't fire before consent.
91. ⬜ Track cart-abandonment rate as a named, watched KPI, not just something the recovery-email cron quietly handles.
92. ⬜ Add cross-sell mechanics beyond the existing related-products row — bundle pricing or "frequently bought together" once there's enough catalog depth.
93. ⬜ Revisit the €50 free-shipping threshold against real margins once actual order data exists, instead of the seeded placeholder value.
94. ⬜ Consider a loyalty/referral program once repeat-purchase data justifies the engineering effort.
95. ⬜ Revisit multi-currency support (intentionally deferred per the improvement spec) only once there's real demand from non-EUR markets — don't build it speculatively.
96. ⬜ Renegotiate Stripe/PayPal processing rates once monthly volume is high enough to qualify for better tiers.
97. ⬜ Turn the existing Returns admin section's data into an actual margin-impact report, not just a queue of tickets.
98. ⬜ Get signed DPAs on file with Stripe/PayPal/host/Resend — usually a dashboard checkbox, just confirm it's actually ticked.
99. ⬜ Put business/cyber insurance and a written incident-response plan in place — GDPR's 72-hour breach-notification clock starts the moment you'd otherwise be scrambling to figure out what happened.
100. ⬜ Once real orders exist, compute unit economics per order (COGS + payment fees + shipping + return rate) before increasing ad spend — growth without knowing this number can scale a loss just as easily as a profit.

---

## Notes on using this list

- This isn't a to-do list to clear top-to-bottom before doing anything else — Security items 1–5 are the only truly blocking ones; the rest can run in parallel with normal feature work.
- Several ✅ items were verified directly against the current codebase/production deployment on 2026-09-16 (see [README.md](../README.md)'s status table and [reports/qa-log.md](../reports/qa-log.md)) — re-verify before trusting them if much time has passed.
- Items that cite a specific file are pointers, not guarantees the file still looks that way — read it before acting on the item.
- Several items depend on each other across sections (e.g. profitability #76/#77 are blocked on nothing but an env var; reliability #34 makes profitability-affecting migrations safer). Where one item unblocks another, that's called out inline.
