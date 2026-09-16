# Murano Storefront — Improvement Prompt

A follow-up to `ecommerce-build-prompt.md`, written the same way: paste this into Claude Code and work through it section by section. It's built from (a) direct competitor research on madeMuranoGlass.com — the closest real competitor in this exact niche — and (b) gaps observed directly in this codebase during this session. Items already in progress or done are marked so nothing gets duplicated.

---

## 0. Status of items already underway this session

- ✅ Site-wide input redesign (`.field`/`.field-checkbox`/`.field-radio` system, animated focus/checkmarks)
- ✅ 46-product Murano catalog imported with real Italian names/descriptions, categorized (Bracciali/Collane/Orecchini)
- ✅ Homepage hero + random per-category product photo (replacing stock placeholders)
- ✅ Share buttons + related-products row on product pages
- ✅ Verified-purchase-gated reviews with an interactive star rating
- ✅ Dark theme removed (light-only, as requested)
- ✅ Footer payment badges, conditional on what's actually configured
- ✅ White-background product photography — done (verified 2026-09-14: `public/products/**` are white-background with reflection styling, `src/components/product-image-zoom.tsx` has `priority` set for LCP)
- ✅ Accurate payment-method logos in the footer — done (`src/components/payment-icons.tsx` uses real Visa/Mastercard/PayPal/Klarna brand colors, self-drawn to avoid trademark/CSP issues)

> **Note (2026-09-14):** this checklist had drifted out of date — most of sections 2, 3, and part of 5 below were already implemented in code (trust badges, best-sellers carousel, newsletter signup with GDPR consent, about-page heritage copy) but left unchecked here. Re-verified against the actual source and corrected below so this doc reflects reality.

---

## 1. Product photography (highest priority — directly requested)

The competitor's entire catalog is shot on **white/light backgrounds in a consistent grid** — this is the industry-standard look for jewelry e-commerce, and our current black-background studio shots read as a wholesale/supplier catalog rather than a retail storefront.

- [x] Finish converting all 46 product photos (+ any future imports) from black to white background using real subject segmentation — done, verified 2026-09-14 (sampled `public/products/bracciali-in-vetro-di-murano/bangle-cremisi-3c2860.jpeg` directly: white background with a mirrored reflection treatment)
- [x] Homepage hero — `src/app/page.tsx` hero image has `priority` set; consistent with the rest of the white-background catalog
- [ ] Longer term: multiple angles per product (competitor shows several angles per item) — would need new source photography, not something existing assets support (our 55 source photos are 46 *distinct* pieces, one photo each, confirmed via checksum dedup)

## 2. Trust & authenticity signals

Murano glass has a real, well-known counterfeiting problem (mass-produced glass from Asia sold as "Murano"), and the competitor leans hard into this:

- [x] Authenticity badge — `src/components/trust-badges.tsx` (`TrustBadges`), admin-editable via `StoreSettings.trustBadgeText`, not hardcoded (stays white-label)
- [x] 14-day EU withdrawal-right messaging surfaced as a visible badge (same `TrustBadges` component, `returnsBadge`) next to the buy button, not just checkout footnote text
- [x] "About Murano Glass" heritage/craftsmanship block on `/about` — `src/app/about/page.tsx` (heritage section + values grid, i18n'd via `dict.about.*`)

## 3. Merchandising sections (homepage)

Competitor's homepage has several proven e-commerce patterns we don't have yet:

- [x] **Best sellers** — `src/components/best-sellers-carousel.tsx`, wired into `src/app/page.tsx`
- [x] **Newsletter capture** — `src/components/newsletter-signup-form.tsx` + `src/app/newsletter/actions.ts`: `NewsletterSubscriber` table (upsert, re-clears `unsubscribedAt` on re-signup), opt-in only, logged via `ConsentLog` with `consentType: "marketing"` exactly like the cookie banner — GDPR posture respected as required
- [ ] Gift-guide / occasion-based landing sections (competitor: Christmas, Valentine's, wedding favors) — lower priority, content-only work once the catalog is bigger; a `Category` with `parentId` already supports this hierarchy in the schema, just unused so far

## 4. Navigation & discovery

- [ ] Category hierarchy: `Category.parentId` already exists in the schema but nothing in the catalog uses it — right now Bracciali/Collane/Orecchini are all flat top-level categories. Not urgent at 3 categories, but worth knowing the schema already supports "Jewelry > Bracelets" style nesting if the catalog grows
- [ ] Breadcrumbs already exist on product/category pages (`← Category` link) — competitor's are more prominent (full trail, not just "back"); a small polish item, not a gap

## 5. UI polish — "more professional," sliders, animation

This was asked for directly and partly overlaps with what's already done:

- [x] **Featured/best-sellers carousel** on the homepage — done with Swiper (`src/components/best-sellers-carousel.tsx`), matches this recommendation exactly
- [ ] Do **not** reach for a heavier "e-commerce UI kit" beyond that — the existing Tailwind v4 + custom `.field`/design-token system is already cohesive and brand-reactive (it derives from `StoreSettings.primaryColor`/`secondaryColor`); swapping to a third-party component library would fight that, not help it
- [ ] Product card hover polish (image swap on hover once multiple images exist, quick-add-to-cart on hover) — nice-to-have, low priority until multi-image products exist
- [x] "Shop by category" carousel entrance/hover animation — done 2026-09-16 (`src/components/category-carousel.tsx`): cards now stagger in (`.category-card`/`card-in` keyframe in `globals.css`, driven by the section's existing `<Reveal>` `data-reveal` flag rather than a second `IntersectionObserver`) and hover gets an accent-tinted glow shadow + image wash + sliding arrow, reusing the same three brand accent colors already cycled per card

## 6. Payments

- [x] Accurate Visa/Mastercard/PayPal/Klarna badge rendering in the footer — `src/components/payment-icons.tsx` uses each brand's real color scheme (self-drawn, not trademarked logo assets — see the security-rationale comment at the top of that file)
- [x] Everything else payments-related (Klarna toggle, Stripe auto-detected wallets, PayPal) is already covered from earlier in this session

## 7. Internationalization

Competitor supports 7 currencies (EUR/USD/GBP/AUD/JPY/CAD/CNY) via a header selector. This store is currently single-currency (`StoreSettings.defaultCurrency`), matching the original build spec's "optional, not urgent" call on multi-currency display. **Not recommended to build now** — real multi-currency needs live FX rates and either multi-currency Stripe pricing or a display-only converter with clear "estimated" labeling; worth a dedicated pass later, not bundled into this one.

---

## How to use this

Work top to bottom — sections are roughly ordered by value-for-effort given where the store is today (photography and trust signals matter more right now than a homepage carousel). Nothing here requires new architecture; every item builds on tables, components, or patterns that already exist in this codebase.
