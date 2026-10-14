# Things to do

Consolidated on 13 October 2026. These are remaining checks and improvements from the project notes. A historical finding needs a current check before being treated as an active defect. Detailed security and owner follow-up stay in ignored local notes.

## First: verify the buying journey

- [ ] Set up a separate test database and test payment credentials.
- [ ] Test product → cart → shipping → payment → confirmation in Italian and English, on phone and desktop.
- [ ] Test order expiry, cancellation, payment retries and emails, including failed requests. Verify stock and credit are released exactly once.
- [ ] Check supplier-managed availability agrees across products, looks, checkout and Merchant feeds.
- [ ] Check confirmation messages for pending, paid, cancelled and refunded orders. Clear only the cart belonging to the completed purchase.
- [ ] Review tax, delivery prices, payment availability, legal text and provenance claims against the store's real settings.

Done means the full journey passes with test data, including failures and retries.

## Content and mobile review

- [ ] Review the saved product-page layout: an earlier audit found a copied home hero and a second main heading. Remove or replace that section if still present.
- [ ] Check phone hero text does not cover jewelry; use a stacked layout where needed.
- [ ] Replace repeated look descriptions with useful product-specific text.
- [ ] Check small carousels, dot navigation and keyboard focus on visible products.
- [ ] Review translations, Arabic layout, 200% zoom and screen-reader navigation.

Product/model/detail/packaging galleries and automatic bundled-photo WebP conversion are implemented locally. Deployment still needs verification.

## Speed: measure, then improve

- [ ] Repeat mobile measurements with the real catalog after the recent bundle changes.
- [ ] Investigate product-page layout shift and slow article hero loading.
- [ ] Review font loading and route-specific CSS before further bundle changes.
- [ ] Profile large catalog queries before adding indexes or changing caching.

Targets: LCP ≤ 2.5 seconds, CLS ≤ 0.1 and INP ≤ 200 milliseconds. See [performance notes](performance-baseline.md).

## Builder: next useful features

- [ ] Add a document schema version and migration function before changing saved formats.
- [ ] Add drafts for page order and visibility.
- [ ] Add tablet overrides with clear inherited values and reset controls.
- [ ] Add conflict detection for simultaneous editing.
- [ ] Test draft → reopen → publish → restore, and screenshot representative templates on phone, tablet and desktop.

Section drafts, publishing, history and the local go-live screen already exist. Rulers, extra media tools and more templates are later improvements, after the buying journey and publishing checks.

## Maintenance

Split large modules one responsibility at a time when changing them. Preserve saved styles, translations and public/private boundaries. Wire up or remove unused recent components only after checking their callers and saved content.

Keep this list current: mark a task complete only with evidence, then remove details that no longer help the next person.
