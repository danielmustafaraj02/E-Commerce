# Architecture audit

Perla Murano Glass, 11 October 2026. Inspected from the repository and a local
production build; versions are the installed ones, not the ones in memory.

## 1. What the system is

One Next.js application, deployed to Vercel from GitHub (`main`), with a public
storefront and a private administration that only ever runs on the owner's
computer.

| Layer | What is used | Notes |
|---|---|---|
| Framework | Next.js **16.3.8** (App Router), React 19.2.8, TypeScript (`strict`) | Upgraded from 16.3.4 in this session (security advisories) |
| Build | Turbopack (`next build`), webpack for `next dev` | `npm run build` = migrate → isolate private routes → convert photos → build → verify no private code shipped |
| Data | PostgreSQL on Neon, Prisma 7.10 with `@prisma/adapter-pg` | 37 models, 37 migrations; reads retried on transient errors (`src/lib/db.ts`) |
| Auth | next-auth v5 (beta), credentials + Google, TOTP MFA | Only built into the local admin; the public build ships a stub that never has a session |
| Payments | Stripe Hosted Checkout + Express Checkout (Elements), PayPal, bank transfer | Server-side pricing, signed webhooks |
| Email | Resend + react-email | Transactional only |
| Storage | `public/` (bundled photos, WebP), Vercel Blob (admin uploads) | |
| Other | Upstash rate limiting, Turnstile, Sentry, Vercel Analytics/Speed Insights | Configured per environment |

### The private-admin split (important, and unusual)

`/admin`, `/account`, `/login`, `/register`, password recovery and their APIs
are **excluded from every public build** (`scripts/private-paths.mjs`,
`scripts/local-routes.mjs`, `scripts/verify-public-build.mjs`). They exist only
in the developer's working tree and run at `http://127.0.0.1:3000` without a
login prompt (loopback + development + private source present). The local admin
uses the **production database** through `.env.local`.

Consequences:
- No internet-facing admin attack surface at all.
- Every admin action, and every test done through the admin, is a production
  write. There is no staging database.
- Guest checkout only: customer accounts are not available on the live site.

## 2. Data model (37 models)

- **Catalog:** Category, Product, ProductImage, ProductPriceChange, Look, Review, Supplier, Fulfillment, WishlistItem
- **Orders and money:** Order, OrderItem, Payment, DiscountCode, GiftVoucher, ReturnRequest, ShippingMethod, ShippingZone(+Country, +Method), TaxRule, Address
- **People:** User, Account, Session, VerificationToken, NewsletterSubscriber, ConsentLog
- **Content and design:** StoreSettings (also holds home/product page layouts, site style tokens and integration keys), PageLayout (other pages' layouts plus reserved keys: `sec-hist:*` version history, `sec-draft:*` drafts, `block-theme`, block presets), PageTemplate (numbered section designs), SectionTemplate (saved templates), JournalPost(+Translation), LegalPage, PageMeta
- **Operations:** AuditLog, ImprovementTask

## 3. Storefront

30 public routes (home, listing, category, product, looks, journal, gift finder,
gift cards, cart, checkout, order confirmation, legal, contact…) and 25 public
API routes (checkout, quote, express checkout, payments, webhooks, feeds,
consent, cron). 11 locales, prefixed URLs (`/en`, `/it`…), rewritten by
`src/proxy.ts`, which also sets a per-request nonce CSP.

Pages are server-rendered; the home page's catalogue data is cached for 60 s.
Images go through `next/image` (AVIF/WebP) with an allowlist of remote hosts.

## 4. The visual builder today

Already substantial. Every storefront page is a list of sections; each section
can be the built-in markup, hand-written HTML, or a **builder document**:

- `LayoutEntry` per section (`src/lib/page-layout.ts`): visibility, style
  (background, overlay, film, spacing, CSS), options, and optionally a `builder`
  document or `html`.
- `BuilderDoc` (`src/lib/section-builder.ts`): 1–4 columns of blocks, 29 block
  types (text, media, shapes, live shop data), per-block style, free position
  and size, rotation, motion (scroll and idle animations), phone overrides.
  Compiled to sanitized HTML + scoped CSS; validated by `parseBuilder`.
- Live blocks (products, looks, reviews, journal…) render through React on the
  site (`src/components/builder-view.tsx`, `builder-live.tsx`).
- Templates: ~70 page templates (`page-templates.ts`), 10 numbered designs per
  section (`section-designs.ts` + `PageTemplate`), saved templates
  (`SectionTemplate`), site style tokens, block styles.
- Editor (local admin): full-window workspace with live canvas (sandboxed
  iframe using the site's own CSS), layers, elements, inspector, undo/redo and
  session history, version history, design checks, import/export.

## 5. Strengths to keep

- Server-authoritative pricing; transactional stock and voucher reservations;
  verified webhooks; idempotent Stripe session creation.
- Admin unreachable from the internet by construction, verified at build time.
- Builder documents are data, validated and compiled to sanitized markup; no
  editor code or arbitrary script reaches the storefront.
- Good test coverage of pure logic (141 files, 1,368 tests).

## 6. Weaknesses and risks

| Area | Finding | Severity |
|---|---|---|
| Hosting | **The live site answers 402 `DEPLOYMENT_DISABLED`**: Vercel has paused the account (usage limits or billing; a commercial shop also needs a Pro plan). Pushes since 4 October have not deployed. | Critical, operational |
| Data safety | The local admin writes straight to production; no staging database, no tested restore procedure. | High |
| Security | Open findings from the 9 October audit (see `security-audit.md`, kept out of Git). | High |
| Repository | The public GitHub history contains a database dump (`local-db-backup-*.dump`, committed 8 October). Removed from tracking; still in history. | High until assessed |
| Performance | Mobile LCP 3.4–4.9 s on home, product and article pages; ~290 KB JS, ~80 KB CSS and 203 KB fonts on every page; CLS 0.28 on the product page. | Medium |
| Maintainability | Very large modules: `section-builder.ts` 2.6k lines, `builder-editor.tsx` 2.8k, `section-editor.tsx` 1.4k, `dictionaries.ts` 10k, `home.css`/`shop.css` ~145 KB each. | Medium |
| Builder | No tablet breakpoint overrides; inherited vs overridden properties not shown; no schema version on documents; drafts only per section (page order still saves directly). | Medium |
| Store-specificity | Copy, templates and some components are written for this brand; a second store would need configuration boundaries first. | Low (no second store planned) |

## 7. The specification against the code

| Spec area | Status | Where / what is missing |
|---|---|---|
| 1 Audit and baseline | **Done** (this document set) | |
| 2 Four layers | Partial | Layers exist in practice (admin workspace / `section-builder` + `page-layout` / storefront renderer / commerce libs) but not as named modules; boundary enforced by the build trace check |
| 3 Editor | Mostly present | Canvas, selection, multi-select, drag, resize, rotation, snapping grid, alignment, layers, lock/hide, copy/paste, undo/redo, history; **added now:** autosave, unsaved-change protection, draft/publish. Missing: rulers, pan, smart spacing guides, group/ungroup UI polish, layer virtualization |
| 4 Templates | Present | 10 numbered designs per section with descriptions, ~70 templates, save as template. Missing: template families for header/footer/cart presentation |
| 5 Responsive | Partial | Computer/phone overrides (position, size, visibility, order, font scale, overlay layout). Missing: tablet overrides, inherited/override indicators, reset-to-inherited per property |
| 6 Preview | Present | Live canvas with real data and site CSS, live preview tab, device widths. Missing: screenshot-based visual regression in CI |
| 7 Media | Partial | Library with folders and search, uploads converted to WebP with metadata stripped, background remover. Missing: tags, focal point, crop presets, duplicate detection |
| 8 Animation | Present | Motion types, easing, delay, stagger, scroll-driven, reduced-motion respected |
| 9 Design system | Present | Site style (8 colour roles, font pairings, palettes), block styles (10 presets). Missing: spacing/radius scale tokens in the UI, versioned theme export |
| 10 Commerce | Present | Products, stock, collections, looks/bundles, discounts, vouchers, gift cards, shipping, tax, 11 locales, Merchant feed. Multi-currency: no |
| 11 Stripe | Present, hardened now | Hosted Checkout, signed webhooks, idempotent sessions, amount checks; **fixed now:** settlement race (F02). Refund handling is manual |
| 12 Go-live wizard | **Built now** | `/admin/settings/go-live`, read-only, six steps |
| 13 Security | In progress | **Fixed now:** F02, F03, F04, F05, Next.js advisories. Open: F01, F06–F15 |
| 14 Performance | Baseline measured | See `performance-baseline.md` |
| 15 Versioning and publishing | Partial, extended now | Section version history (12 versions), **section drafts + publish (new)**. Missing: page-order drafts, scheduled publishing, conflict detection between two editors |
| 16 UX | Improved | Workspace editor, visual galleries, page overview, Site/Block style workspaces |
| 17 Testing | Partial | Strong unit coverage; no end-to-end or visual regression suite in CI |
