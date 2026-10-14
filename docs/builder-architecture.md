# Visual builder

The editor runs in the private local admin. Visitors see only published layouts.

## Main modules

| Module                                                                      | Job                                                 |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| `src/app/admin/settings/page-layout/`                                       | Editor canvas and controls; private source          |
| `src/lib/section-builder.ts`                                                | Document types, validation and HTML/CSS compilation |
| `src/lib/section-builder-editing.ts`                                        | Editing commands and canvas CSS                     |
| `src/lib/section-templates.ts`                                              | Built-in designs                                    |
| `src/lib/page-layout.ts`                                                    | Page targets, sections and layout options           |
| `src/lib/page-layout-store.ts`                                              | Published layout reads                              |
| `src/lib/section-drafts.ts`, `section-versions.ts`                          | Drafts and version history                          |
| `src/components/layout-section.tsx`, `builder-view.tsx`, `builder-live.tsx` | Storefront rendering                                |

A page is an ordered list of sections. Each section can use built-in content, custom markup or a `BuilderDoc` containing columns and blocks. Desktop properties are the base; phone properties override them. Tablet overrides are not yet part of this model.

## Storage and publishing

Home and product layouts live in `StoreSettings`. Other layouts use `PageLayout` rows keyed by page target. Section drafts use `sec-draft:<page>:<section>`; history uses `sec-hist:<page>:<section>` and keeps the latest 12 versions. Templates use `PageTemplate` and `SectionTemplate`.

The editor autosaves a section draft after a short pause. **Publish** updates the visible section, records the old version and clears the draft. **Discard** restores the published version. Reopening resumes an existing draft.

Page order and visibility still save directly. Two editors can overwrite each other's changes; there is no conflict detection yet.

## Rules to preserve

- Shared document logic has no browser, React or database dependency.
- Public renderers never import the admin editor.
- Documents are data: validate blocks, sanitize HTML, scope CSS and check media URLs. Never execute content scripts.
- Product blocks reference catalog data; checkout prices and stock remain server-controlled.
- Preserve saved document fields and CSS selectors during refactors.

Remaining work is in the [roadmap](implementation-roadmap.md).
