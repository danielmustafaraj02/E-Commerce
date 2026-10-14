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

# Design guide

Keep the shop calm and easy to read. Let the jewelry photographs carry the color.

## Visual rules

- Petrol (`#123d43`) for text, links and primary controls; ivory and white for surfaces.
- Champagne gold for fine borders and small accents. Glass teal, rose and gold are decorative accents.
- Separate panels with a thin border and a subtle surface tint. Avoid strong card shadows.
- Cormorant Garamond for headings, product names and prices; DM Sans for body text, navigation, forms and buttons. Store-selected font settings can override the default pairing.
- Reuse existing spacing, radii and component classes. Preserve selectors used by saved builder designs.

## Photos and layout

Show the complete product without stretching or cropping important details. Product galleries follow: product photo, model photo, close-up, packaging last. Keep jewelry shape and color faithful across images.

Use generous spacing and responsive layouts. Check narrow phones, tablets, desktop and Arabic right-to-left pages. Prevent horizontal overflow and reserve image space before loading.

## Controls and accessibility

Primary buttons use petrol, light text and a fine gold border. Secondary buttons use a light surface and petrol text. Inputs need visible labels, clear errors and keyboard focus.

Aim for 44-pixel touch controls, keep phone inputs at least 16 pixels, and pair status colors with text. Respect reduced-motion preferences. Use motion only when it helps the interaction.

## Before approving a design

Check readable text, clear prices and delivery information, consistent photos, keyboard focus, mobile spacing and truthful product claims. Certification and review rules are in [Product](PRODUCT.md).
