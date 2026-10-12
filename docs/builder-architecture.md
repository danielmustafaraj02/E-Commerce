# Builder architecture

How the visual builder is put together, and the rules that keep it safe. Read
with `architecture-audit.md`.

## Layers and dependency direction

```
A. Visual editor        src/app/admin/settings/page-layout/**   (local admin only)
        │ uses
        ▼
B. Design engine        src/lib/section-builder.ts   BuilderDoc: schema, validation, compile to HTML/CSS
                        src/lib/page-layout.ts       LayoutEntry, page targets, section catalogue
                        src/lib/section-designs.ts, page-templates.ts   templates
                        src/lib/site-style.ts, block-theme.ts           design tokens
                        src/lib/section-drafts.ts, section-versions.ts  draft and history storage
        ▲ used by
C. Storefront renderer  src/components/layout-section.tsx, builder-view.tsx, builder-live.tsx
                        src/lib/page-layout-store.ts (reads published layouts only)
D. Commerce/publishing  src/lib/pricing.ts, place-order.ts, order-payment.ts, stripe.ts, …
```

Rules:
1. **B is pure.** No DOM, no React, no database. It is imported by both A and C.
2. **C never imports A.** The public build moves every admin file out before
   compiling and fails if any admin path appears in a server trace
   (`scripts/verify-public-build.mjs`).
3. **Documents are data, never code.** Builder blocks are an allowlist of types
   and properties; compiled HTML goes through `sanitizeSectionHtml`; custom CSS
   is scoped with `scopeSectionCss`; image and video URLs pass `safeImageUrl` /
   `safeVideoUrl`. No user-supplied script ever runs on the storefront.
4. **Commerce is server-authoritative.** Builder blocks that show products only
   reference data; prices, stock and totals are always re-read on the server.

## The document

```
Page (target)            home | product | about | contact | looks | journal | article | category | list
└─ LayoutEntry[]         one per section, in page order
   ├─ id, visible
   ├─ style              background (colour/gradient/image/film), overlay, spacing, scoped CSS
   ├─ options            section-specific choices (e.g. Look row style)
   ├─ html               hand-written markup replacing a built-in section, or
   ├─ custom             a section of the owner's own (name, html, css), or
   └─ builder: BuilderDoc
       ├─ columns 1–4, widths, gap, divider, valign, width: full
       ├─ mobile         reverse, hidden columns, gap, font scale, overlay layout
       └─ cells[col][]   BuilderBlock: 29 types, each with
                         style (position, size, rotation, colours, spacing, effects),
                         phone position/size (mx, my, mw, mh), motion, translations
```

Responsive model today: computer is the base; phone overrides are stored next
to the property they override (`mx` beside `x`). There is no tablet layer yet.

## Storage

| What | Where |
|---|---|
| Home / product page layout (published) | `StoreSettings.homeLayout`, `.productPageLayout` |
| Other pages' layouts (published) | `PageLayout` row keyed by the page target |
| Section version history | `PageLayout` row `sec-hist:<page>:<section>` (12 newest) |
| **Section draft (new)** | `PageLayout` row `sec-draft:<page>:<section>` |
| Block styles, block presets | `PageLayout` rows `block-theme`, block presets key |
| Numbered designs per section | `PageTemplate` |
| Saved templates | `SectionTemplate` |

The storefront reads a page's own key only, so reserved keys can never reach the
site. They need no migration.

## Draft and publish (added in this phase)

- The editor **autosaves** the working copy as a draft about 1.2 s after the
  last change: never on every keystroke or drag, and never just for opening a
  section.
- The live site **does not change** until **Publish**. Publish writes the
  section into the page, keeps the replaced version in history, writes the
  audit log, and deletes the draft. All of this happens in `saveSectionEntry`.
- **Discard draft** deletes the draft and returns to the live version.
- Reopening a section resumes its draft and says so. The page overview marks
  sections that have unpublished drafts.
- Leaving the editor with changes the server does not have yet asks for
  confirmation.

Known limits: page order and visibility still save directly (they are a
separate, small list); there is no conflict detection if two people edit the
same section at once (one editor in practice).

## Next steps for the engine

1. Add `v` (schema version) to `BuilderDoc` with a migration function, before
   any breaking change to the format.
2. A tablet layer: overrides stored like phone overrides, with inheritance
   phone ← tablet ← computer, and per-property "inherited / overridden / reset"
   in the inspector.
3. Split `section-builder.ts` into schema, compile, templates and CSS modules
   (no behaviour change; tests first).
4. Page-level drafts (order and visibility) using the same reserved-key
   storage.
