---
target: the whole storefront (all customer-facing pages) and the admin backend
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/home/daniel/Desktop/E-Commerce/the whole storefront (all customer-facing pages: home, category/product listing, product detail, cart, checkout, account, gift-finder, looks, blog) and the admin backend"
timestamp: 2026-09-25T13-04-33Z
slug: t-finder-looks-blog-and-the-admin-backend-e939567a
closed: true
---
Method: dual-agent (A: a45353d6c265bf02b · B: aff0914c80e3cffa4)

⚠️ Both assessments are code-based only — no dev server or browser-automation tool was available this session, so nothing below reflects a live visual/contrast check. Rendered color contrast, real focus-ring visibility, and animation feel (hero carousel, confetti, checkmark "settle") should be re-verified with actual screenshots; everything else (missing controls, hardcoded strings, token violations, layout logic) is verified directly from source.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Good live feedback (checkout quote in aria-live="polite", free-shipping progress bar), but checkout never re-confirms what's being paid for. |
| 2 | Match Between System and Real World | 3/4 | Warm, jargon-free copy throughout; occasional drift (see #4). |
| 3 | User Control and Freedom | 2/4 | Shipping method is computed and never exposed for the shopper to change — a real dead end. |
| 4 | Consistency and Standards | 2/4 | Concrete breaks from the system just documented in DESIGN.md: glass-accent colors used as status colors, 3 visible drop-shadow violations of the No-Lift Rule. |
| 5 | Error Prevention | 3/4 | Strong on storefront (Zod, live validation, Turnstile); admin discount form lets percent-off and amount-off both be filled or both be empty with no client-side guard. |
| 6 | Recognition Rather Than Recall | 2/4 | Checkout never shows cart contents (must recall from /cart); admin lists have no search, forcing recall of SKU/order number while scrolling. |
| 7 | Flexibility and Efficiency | 2/4 | Nice storefront accelerators (quick-add, express checkout), but admin — a real daily operating tool per PRODUCT.md — has no bulk actions, no search, and orders hard-cap at 100 rows with no pagination. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Storefront is genuinely restrained; a few off-system color/shadow moments puncture the "quiet, precious" intent. |
| 9 | Error Recovery | 3/4 | Consistent inline-error pattern, state preserved on failure; some messages don't say why, capping this below 4. |
| 10 | Help and Documentation | 2/4 | Storefront FAQ is genuinely contextual and good; admin has zero help/tooltips for staff. |
| **Total** | | **26/40** | **Acceptable (65%)** |

All ten heuristics were scored — the admin backend is a real Operate-mode surface per PRODUCT.md, not a demo, so 7 and 10 were deliberately not marked n/a.

## Design Specificity Verdict

**LLM assessment**: Genuinely authored for Murano glass jewelry, not a reskinned generic store. The product tile drops its photo frame entirely (mix-blend-mode: multiply + feathered mask) so pieces "dissolve" into the ivory page exactly as DESIGN.md's "glass supplies the color" rule intends; filter-panel color swatches render as tiny glowing glass beads with real radial-gradient depth, not flat circles; the PDP carries dedicated heritage/authenticity sections tied to the 700-year story. It slips back toward generic-template territory in one clear place: the entire admin backend is bare gray-and-primary CRUD tables with none of the ivory/petrol system applied — a reasonable trade for an internal tool, but a visible seam.

**Deterministic scan**: impeccable detect --json src/app src/components (186 files) → exit 2, 13 primary findings, 206 advisory. Primary: bounce-easing x10, design-system-font-size/radius/color advisories total 206 (165/28/13), layout-transition x2 (gift-finder.css:27, shop.css:800, both "transition: width" — a layout-thrashing perf smell, notably on the same free-shipping progress bar Assessment A praised for good status feedback), design-system-font x1. Most bounce-easing hits were verified false positives — they match the documented "ease-overshoot" token for checkbox/radio pop and cart-bump exactly. The 206 advisory findings mostly reflect that font-size/radius were never formally tokenized project-wide before this session — expected drift, non-blocking, addressable later via /impeccable extract if a fuller token migration is wanted.

**Visual overlays**: unavailable this run — no browser-automation tool exposed and no live dev server running. No user-visible overlay exists; treat the file:line citations as the evidence trail instead.

## Overall Impression

The storefront has real authored craft — the photo-dissolve product tile and glass-bead swatches are the kind of detail a generic template never produces, and the emotional peak (order confirmation) genuinely lands. But the site drops the ball at its two highest-stakes moments: checkout hides both the cart contents and the shipping choice from the shopper, and the admin backend — explicitly a real daily tool, not a demo — has no search, bulk actions, or pagination past 100 rows. The single biggest opportunity is checkout: one page away from being excellent, currently asking shoppers to pay for something they can't see or fully control.

## What's Working

1. **The product tile's "glass supplies the color" execution** (src/app/home.css .shelf-item-photo) — genuinely specific, shipped consistently across home, category, PDP, and wishlist grids.
2. **Progressive disclosure on the PDP** (src/app/products/[slug]/page.tsx, <details> shipping/care/authenticity blocks + ExpandableText) — textbook execution.
3. **The order-confirmation peak** (order-confirmation/[orderNumber]/page.tsx) — settle-checkmark animation, status-correct copy, itemized order, first-purchase confetti. The site's best emotional beat.

## Priority Issues

**[P1] Shipping method is computed but never shown or selectable**
- Why it matters: checkout-client.tsx auto-picks methods[0] and only shows the name as read-only text. Admin explicitly supports multiple paid methods per zone — a real merchandising lever gift buyers especially need (paying to hit a date) and currently can't use.
- Fix: Render a visible radio group of shipping methods (name, price, ETA) bound to shippingMethodId.
- Suggested command: /impeccable harden

**[P1] Checkout never shows what's in the cart**
- Why it matters: No line items, images, or quantities anywhere on /checkout — the shopper must trust memory of /cart while paying. Textbook "Memory Bridge" violation at the single highest-stakes screen in the funnel.
- Fix: Add a compact, collapsible order-summary list above/beside the price breakdown, sourced from the cart state already in memory.
- Suggested command: /impeccable clarify

**[P1] Admin has no search, bulk actions, or pagination past 100 rows**
- Why it matters: admin/orders/page.tsx hard-caps at take: 100 with zero pagination UI — orders beyond #100 become invisible with no indication more exist. admin/discounts/discount-form.tsx lets percent-off and amount-off both be filled or both empty until a server round-trip catches it.
- Fix: Add search/filter + real pagination to orders/products; make percent/amount a mutually-exclusive toggle.
- Suggested command: /impeccable harden

**[P2] Design-system drift: off-role colors and three No-Lift violations**
- Why it matters: gift-finder.css:239-241 colors signup success/error text with the Glass Teal/Rose decorative tokens instead of Success/Error — a direct break of DESIGN.md's "Glass Supplies the Color" rule (the detector can't catch this one: the values are on-palette, just used in the wrong role). Separately, three spots carry real visible drop shadows against the documented No-Lift Rule: globals.css:923 (carousel-nav hover, paired with a scale-up — a genuine "lift"), shop.css:1033 (mobile sticky add-to-cart bar), shop.css:1998 (cart gift-card preview, 40% opacity). The detector has no shadow/elevation rule at all, so these have no deterministic corroboration either way — worth a quick visual check.
- Fix: Swap the email-status colors to --success/--danger; cap the three shadows to the documented ambient (0 1px 1-2px) vocabulary.
- Suggested command: /impeccable polish

**[P2] "transition: width" on two auto-animating elements (detector-caught)**
- Why it matters: gift-finder.css:27 and shop.css:800 animate width directly instead of transform: scaleX() — a layout-thrashing pattern that forces reflow every frame. The gift-finder one is the free-shipping progress bar Assessment A specifically called out as good status feedback, so the UX pattern is right, the implementation just costs more than it needs to.
- Fix: Switch both to a transform: scaleX()-based fill.
- Suggested command: /impeccable optimize

**[P3] Tablet-width gap drops search, About, and the heritage guide link entirely**
- Why it matters: In header.tsx, the hamburger is sm:hidden (gone <640px), search needs lg:flex (>=1024px), About/Murano-Glass-Guide need xl:inline-flex (>=1280px). Between 640-1280px — most tablets and small laptops — there's no hamburger and no search/About/Guide visible anywhere. PRODUCT.md's heritage-legibility principle is fully violated in that band.
- Fix: Extend the hamburger to lg:hidden, or restore search/About/Guide at sm/md.
- Suggested command: /impeccable layout

## Persona Red Flags

**Casey (Distracted Mobile User)**: On a tablet in the 640-1024px range, search is invisible and so is the hamburger that would contain it — no way to search at all in that width band. She also can't tap "Express shipping" even willing to pay for it (shipping picker doesn't exist).

**Riley (Deliberate Stress Tester)**: Immediately fills both percentOff and amountOff on the discount form — nothing stops her until a server round-trip. At checkout, she notices "Shipping (Standard)" with no visible alternatives or reasoning — the system silently decided for her.

**Jordan (extended: gift-buyer/self-purchaser dual audience)**: A first-time, non-English-speaking self-purchaser securing their account hits account/mfa/page.tsx and is dropped into hardcoded English mid an otherwise fully-translated 11-locale flow — every sibling page (login, register, reset-password) goes through the dictionary; MFA doesn't. This is the clearest violation of PRODUCT.md's "global-first" principle in the codebase.

**Sam (Accessibility-Dependent User)**: The MFA page's manual-entry-key fallback next to the QR code is a genuinely good accessible pattern. But the gift-finder's "selected" option state relies mostly on a ~1% luminance background shift (#fff -> #faf8f5) — effectively invisible to low-vision users; the border-color change is doing all the real work.

## Minor Observations

- Blog content is lang="en"-only across all 11 locales — the brand-story journal is effectively English-only despite the storefront's global reach.
- StatusBadge correctly pairs color with a text label everywhere — confirmed clean, worth knowing it's not silently regressed.
- The homepage hero's background blobs use #7cc7c0/#e8607f, which are softened variants of the documented Glass Teal/Rose tokens, not exact matches — possibly worth adding as named tokens in a future DESIGN.md pass rather than leaving as undocumented drift.
- 206 advisory findings (mostly font-size/radius) reflect that spacing/type-size were never formally tokenized before this session — non-blocking, expected for a codebase this size.

## Questions to Consider

1. The shipping-method picker exists end-to-end in the data layer and admin UI but was never wired into checkout — was this cut for time, or is "one shipping option" the intended model?
2. Checkout went single-page to reduce friction — but does removing the cart recap and shipping choice actually save friction, or just move it to "shopper opens a second tab to double-check before paying"?
3. DESIGN.md was just established this session — is it retroactively binding (sweep the existing drift) or only enforced going forward?
