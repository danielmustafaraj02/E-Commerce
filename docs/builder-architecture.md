# Page design

The site's look is code. Page layouts, colours, fonts, block styles and the
home hero live in `src/design/` and ship with each deploy; nothing about the
look is read from the database, and the admin has no design tools. Every page
of a kind (every product, every article) uses the same layout.

To change the look, edit `src/design/`, check it locally and deploy.

## Main modules

| Module                                                                      | Job                                                 |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| `src/design/layouts.ts`                                                     | Page layouts (home, product, article)               |
| `src/design/theme.ts`                                                       | Colours, fonts, brand colours and block styles      |
| `src/design/hero.ts`                                                        | The home page hero                                  |
| `src/lib/section-builder.ts`                                                | Document types, validation and HTML/CSS compilation |
| `src/lib/section-templates.ts`                                              | Built-in designs                                    |
| `src/lib/page-layout.ts`                                                    | Page targets, sections and layout options           |
| `src/lib/page-layout-store.ts`                                              | Reads a page's layout from `src/design/`            |
| `src/components/layout-section.tsx`, `builder-view.tsx`, `builder-live.tsx` | Storefront rendering                                |

A page is an ordered list of sections. Each section can use built-in content, custom markup or a `BuilderDoc` containing columns and blocks. Desktop properties are the base; phone properties override them. A page not listed in `layouts.ts` uses its built-in layout.

Layouts go through the same validation as before (`resolveLayout`), so a mistake in `layouts.ts` falls back to the built-in section instead of breaking the page.

## The archived visual editor

The admin's visual editor (Page layout, Site style, Block styles, Hero concepts, Page text, the article opening designer and the Roadmap) was removed on 2026-10-16 and kept outside the repository in `../E-Commerce-design-editor/`. Its README explains how to put it back. The old design data is still in the database (`PageLayout` rows and the design columns of `StoreSettings`); nothing reads it.

## Rules to preserve

- Shared document logic has no browser, React or database dependency.
- Documents are data: validate blocks, sanitize HTML, scope CSS and check media URLs. Never execute content scripts.
- Product blocks reference catalog data; checkout prices and stock remain server-controlled.
- Preserve document fields and CSS selectors during refactors.
- A page states its own stylesheet order (base first, overrides last) rather than relying on the order other pages import them in.

Remaining work is in the [roadmap](implementation-roadmap.md).
