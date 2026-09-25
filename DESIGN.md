---
name: Perla Murano Glass
description: A quiet, gallery-cool storefront for genuine hand-blown Murano glass jewelry — ivory pages, deep petrol ink, a hairline of champagne gold.
colors:
  petrol: "#123d43"
  petrol-deep: "#0b3035"
  gold: "#b89a62"
  gold-soft: "#d9c7a0"
  champagne-hairline: "#d9cdbb"
  ivory-surface: "#faf8f5"
  ivory-panel: "#fbf9f5"
  paper-white: "#ffffff"
  ink-soft: "#527176"
  glass-teal: "#1f7a85"
  glass-rose: "#c65b8a"
  glass-gold: "#f5c451"
  danger: "#dc2626"
  success: "#15803d"
  warning: "#b45309"
  secondary-admin-default: "#4f46e5"
typography:
  display:
    fontFamily: "Cormorant Garamond, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
    fontSize: "clamp(2.3rem, 5.5vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Cormorant Garamond, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
    fontSize: "clamp(2rem, 3.8vw, 2.8rem)"
    fontWeight: 500
    lineHeight: 1.1
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.4rem"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    letterSpacing: "0.2em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "0.75rem"
  lg: "0.9rem"
  xl: "14px"
  pill: "999px"
spacing:
  sm: "0.75rem"
  md: "1.25rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "#fbf9f5"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 1.35rem"
  button-primary-hover:
    backgroundColor: "color-mix(in srgb, #123d43 72%, black)"
    textColor: "#fbf9f5"
  button-secondary:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.petrol}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.15rem"
  field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.petrol}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.65rem 0.95rem"
  card:
    backgroundColor: "{colors.ivory-panel}"
    textColor: "{colors.petrol}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
---

# Design System: Perla Murano Glass

## Overview

**Creative North Star: "The Murano Journal"**

The site reads as a hand-bound ledger documenting each piece rather than a typical retail shelf: near-white ivory pages, a single deep petrol ink for type and interaction, and a hairline of champagne gold as the only ornament. The glass itself — teal, rose, gold — supplies the sole bursts of saturated color, in photographs and in one decorative rule at the header/footer edge; everything else stays deliberately quiet so those pieces read as precious.

The overall philosophy is luxe, gallery-cool, and minimal: flat surfaces separated by hairline borders rather than shadows, a serif display face (Cormorant Garamond) for headings, prices and product names against a plain sans (DM Sans) for every interactive and body surface, and motion kept to a handful of small, purposeful moments (a settling hero bead, a cart bounce, a confetti burst) rather than pervasive hover choreography.

**Key Characteristics:**
- Ivory paper + Deep Lagoon Petrol ink, with Champagne Gold as the only ornamental accent
- Flat by default — hairline borders and tonal panels carry separation, not shadows
- Cormorant Garamond (display/serif) paired with DM Sans (UI/sans), strict role separation
- The product photograph is the only saturated color on most screens
- Motion is sparse and purposeful, never ambient or decorative-only

## Colors

A near-monochrome ivory-and-petrol system where the glass photography is the one saturated element on the page.

### Primary
- **Deep Lagoon Petrol** (`#123d43`): the system's one ink color — body text, primary buttons, links, focus states, icons. Used for nearly everything that isn't a hairline or a panel fill.
- **Petrol Deep** (`#0b3035`): the pressed/hover-darkened state of petrol, never used as a standalone surface color.

### Secondary
- **Champagne Gold** (`#b89a62`): sparing ornament only — the hairline border on primary buttons, the rule under page titles, empty-state icon strokes, the four-color decorative band at header/footer edges. Never a fill or a body-text color.
- **Soft Champagne** (`#d9c7a0`): a lighter companion to Champagne Gold for subtler gold moments (e.g. gradients, secondary rules).

### Neutral
- **Champagne Hairline** (`#d9cdbb`): the system's one border/divider color — every panel, card, and section rule uses this, not gray.
- **Ivory Surface** (`#faf8f5`): section-band tint, the barely-warm alternative to pure white.
- **Ivory Panel** (`#fbf9f5`): panel/card fill (`.shop-panel`, `.form-card`) — one shade warmer than Ivory Surface so panels read as a distinct object against a tinted section.
- **Paper White** (`#ffffff`): the page ground and every input's fill.
- **Soft Lagoon** (`#527176`): secondary/muted text (placeholders, captions, compare-at prices) — a lighter tint of petrol, never a separate hue.

### Glass Accents (decorative only — not for UI chrome)
- **Glass Teal** (`#1f7a85`), **Glass Rose** (`#c65b8a`), **Glass Gold** (`#f5c451`): drawn directly from the product itself. Used only in the header/footer decorative gradient band and the homepage hero's soft background blobs — never on buttons, links, or any interactive control.

### Semantic
- **Error Red** (`#dc2626`), **Success Green** (`#15803d`), **Warning Amber** (`#b45309`): standard status colors for form validation and alerts, always paired with an icon and message, never color alone.
- **Admin Secondary Default** (`#4f46e5`): the default value of the admin-editable `--store-secondary` token. Unlike every other token above, this one is intentionally *not* part of the fixed brand palette — merchants can repoint it from the admin settings panel.

### Named Rules
**The One Ornament Rule.** Champagne Gold appears only as a hairline, rule, or border — never as a fill, a large shape, or body text. Its rarity is what makes it read as precious rather than decorative.

**The Glass Supplies the Color Rule.** Glass Teal/Rose/Gold exist to echo the product photography, not to color UI chrome. If a control needs an accent color, it's petrol or gold — never a glass tone.

## Typography

**Display Font:** Cormorant Garamond (with "Iowan Old Style", "Palatino Linotype", Georgia, serif fallback)
**Body/UI Font:** DM Sans (with system-ui, sans-serif fallback)

**Character:** A restrained pairing — Cormorant Garamond's old-style serif gives headings, product names, and prices a quiet, editorial warmth, while DM Sans keeps every interactive surface (navigation, buttons, forms, labels) plain and legible. The two faces are never mixed within one role.

### Hierarchy
- **Display** (weight 500, `clamp(2.3rem, 5.5vw, 3.5rem)`, line-height 1.1): page-level `<h1>` titles (shop/category headers).
- **Headline** (weight 500, `clamp(2rem, 3.8vw, 2.8rem)`, line-height 1.1): homepage section headings ("the shelf").
- **Title** (weight 500, `1.4rem`, line-height 1.45): page ledes/intros directly under a Display heading.
- **Body** (weight 400, `1.0625rem`, line-height 1.6): running copy, product descriptions; DM Sans.
- **Label** (weight 500, `0.8rem`, letter-spacing `0.2em`, uppercase): button text and small UI labels — always DM Sans, always spaced caps, never the display face.

### Named Rules
**The Role-Locked Face Rule.** Cormorant Garamond is reserved for headings, product names, prices, and the empty-state signature line. DM Sans owns every button, nav item, form field, and label. A component never borrows the other face for emphasis.

## Layout

The storefront runs on a `.shelf`-scoped system: a 64rem (`.shelf-wrap`) reading column for most content, widened to 84rem (`.shelf-wrap--wide`) for product listings that need more breathing room per row. Sections stack as full-bleed color-blocked bands (`.shelf-section--lilac/aqua/sand/blush`, all currently near-identical soft ivory tints) separated by hairline rules rather than gaps or shadows.

Product grids are responsive column counts, not fluid auto-fit: 2 columns on mobile stepping to 3 (`.shop-grid`, listing pages) or 4 (`.shelf-row`, homepage rows) at the `40rem`/`48rem` breakpoints, with generous gap increases at the wider step (from `1rem` to `2–3.5rem`). Section vertical rhythm runs large — `2.5–3.5rem` block padding at rest, up to `5rem` on wide listing pages — reinforcing the unhurried, editorial pacing.

Touch targets are enforced site-wide at `2.75–2.9rem` minimum height under `(pointer: coarse)`, and form fields lock to `16px` under `40rem` width to prevent iOS auto-zoom.

## Elevation & Depth

Flat by default. The system does not use shadows as a structural depth cue — panels and cards are separated from their background by a `1px` Champagne Hairline border and a one-shade fill shift (Ivory Panel vs. Ivory Surface/Paper White), not elevation. Where a `box-shadow` does appear, it is a near-invisible `0 1px 1–2px` ambient hint (form fields, cards) or a functional focus/selection ring (`0 0 0 3–4px`, color-mix of the accent) — never a visible "lifted" card effect.

### Shadow Vocabulary
- **Ambient hairline** (`box-shadow: 0 1px 1-2px color-mix(in srgb, var(--foreground) 4-10%, transparent)`): the faintest possible seam under panels/cards and the color-swatch/carousel-nav controls — reads as a texture, not a lift.
- **Focus/selection ring** (`box-shadow: 0 0 0 3-4px color-mix(in srgb, var(--accent) 16-28%, transparent)`): the only *visible* shadow use — always tied to `:focus-visible` or a checked/selected state, never decorative.

### Named Rules
**The No-Lift Rule.** Nothing gets a visible drop shadow to signal "this is a card." Borders and fill contrast do that job; shadow is reserved for focus rings and the faintest ambient seam.

## Shapes

Corner radius scales with a control's formality, not a single global value. Small interactive chrome (badges, discount tags) stays nearly square (`2px`); buttons take a light `6px`; form fields and small cards sit at `0.75–0.9rem` (`12–14px`); larger panels and filter cards round further to `14–18px`; anything circular (avatars, color swatches, checkboxes-as-dots, pill chips, the empty-state icon ring) goes fully round at `999px`. Borders are hairline (`1–1.5px`) throughout, always Champagne Hairline or a color-mixed tint of the current accent — never a heavier structural border.

## Components

### Buttons
- **Shape:** `6px` radius, hairline `1px` gold border on the primary style only.
- **Primary:** Deep Lagoon Petrol fill, off-white (`#fbf9f5`) text, `1px` Champagne Gold border, `0.7rem 1.35rem` padding, DM Sans Label typography (uppercase, spaced caps on the homepage `.shelf-button` variant; sentence case on the shared `.btn-primary`). Hover darkens toward black (`color-mix … 72% black`); never brightens or shifts hue.
- **Secondary:** transparent/white fill, Champagne Hairline border, petrol text; hover deepens the border to full petrol rather than filling the background.
- **Danger / Danger-outline:** same shape language, Error Red fill or outline, used only in destructive admin/account actions (delete, cancel).
- **Hover / Focus:** all button variants share a `2px` petrol outline on `:focus-visible`, offset `2px`; hover is a color shift only, never a shadow or scale change (buttons don't lift).

### Chips
- **Filter chip (`.shop-chip`):** pill-shaped, hairline border, translucent white fill; hover fills solid petrol with white text.
- **Badges (`.shelf-badge`, `.shelf-discount-badge`):** near-square (`2px` radius) corner tags — solid petrol/ivory for stock badges, outlined petrol-on-ivory for discount tags — always positioned in a product tile's corner, never overlapping.

### Cards / Panels
- **Corner style:** `12–18px` depending on context (`.shop-panel` 12px, `.shop-filter-card` 14px, generic `.form-card` `0.9rem`).
- **Background:** Ivory Panel (`#fbf9f5`) against a page that's Paper White or Ivory Surface — the one-shade lift is the only "elevation" cue.
- **Shadow strategy:** none, or the faintest ambient hairline shadow (see Elevation & Depth) — never a visible lift.
- **Border:** `1px` Champagne Hairline, always.
- **Internal padding:** `1.25–1.5rem`.

### Inputs / Fields
- **Style:** Paper White fill, `1.5px` border at 16% petrol tint, `0.75rem` radius, `0.65rem 0.95rem` padding.
- **Focus:** border shifts to full petrol/accent, plus a soft `3.5px` color-mixed glow ring — no border-color change on hover, only a 50%-tint preview.
- **Error / Disabled:** `aria-invalid` swaps the border (and its focus ring) to Error Red; disabled drops opacity to `0.55` and tints the fill toward petrol at 4%.
- **Checkbox / Radio:** custom-drawn, square/circular respectively, with a petrol fill and white checkmark/dot that pops in with a slight overshoot on check — never a flat instant toggle.

### Navigation
- Plain DM Sans nav links with a scale-drawing underline (`::after`, `scaleX` on hover) and a soft rounded-pill background fade-in behind the text on hover/focus — both interaction-triggered, exempt from the reduced-motion guard that covers entrance animations. Mobile nav collapses to an off-canvas menu (see `mobile-nav-menu.css`).

### Product Tile (`.shelf-item` / signature component)
The core commerce unit, and the system's clearest expression of "the glass supplies the color": photos sit on `2:3` frames with `mix-blend-mode: multiply` and a feathered edge mask so each product's white background dissolves directly into the ivory page — no visible photo frame or card border. The product name (Cormorant Garamond, `1.15rem`) and price (Cormorant Garamond, `1.15rem`, weight 500) sit directly beneath with no container, separated from the photo by a `0.3rem` gap only. The entire tile is one stretched link; a corner badge (stock/discount) is the only overlay element permitted on the photo itself.

## Do's and Don'ts

### Do:
- **Do** keep Champagne Gold to hairlines, rules, and borders — treat any gold fill or large gold shape as a violation of the One Ornament Rule.
- **Do** let product photography be the only saturated color on a page; keep UI chrome to petrol, gold, and ivory/white.
- **Do** separate panels from background with a hairline border and a one-shade fill shift, not a shadow.
- **Do** keep Cormorant Garamond strictly to headings/names/prices and DM Sans to every interactive/UI surface.
- **Do** respect `prefers-reduced-motion`: all auto-playing entrance/ambient animation must collapse to instant; interaction-triggered feedback (hover lifts, underline draws) may remain.

### Don't:
- **Don't** add a visible drop shadow to signal elevation — this system uses borders and fill contrast, never a "lifted card" look.
- **Don't** use Glass Teal/Rose/Gold on buttons, links, or any interactive control — those three exist only to echo the product photo in decorative, non-interactive contexts.
- **Don't** imply the protected "Vetro Artistico® Murano" certification mark in copy or badges unless the specific product actually holds it (durable product constraint, not a visual one — see PRODUCT.md).
- **Don't** mix Cormorant Garamond into body copy or DM Sans into headings — the two faces are role-locked, not interchangeable for emphasis.
