import { blockThemeCss, parseBlockTheme } from "@/lib/block-theme";
import type { SiteStyle } from "@/lib/site-style";

/**
 * Colours, type and block styles of the storefront, as code (frozen from the
 * old Site style / Block styles editors on 2026-10-16). Change them here and
 * redeploy; nothing about the look is read from the database any more.
 */

/** The eight colour roles and two type roles (see lib/site-style.ts). */
export const SITE_STYLE: SiteStyle = {
  colorBackground: "#f6fafd",
  colorSurface: "#e2eef7",
  colorText: "#0e2238",
  colorTextMuted: "#4a6178",
  colorPrimary: "#1d4e89",
  colorOnPrimary: "#ffffff",
  colorAccent: "#2a6fb0",
  colorBorder: "#cfe0ee",
  fontHeading: "Gloock",
  fontBody: "Inter",
};

/** The two brand colours: published as --store-primary/--store-secondary on
 *  every page, and used directly in transactional emails (no CSS there). */
export const BRAND_COLORS = {
  primary: "#111827",
  secondary: "#4f46e5",
} as const;

/** One look per builder block type (headings, images, text, buttons…),
 *  compiled to CSS once when the server starts instead of on every request. */
export const BLOCK_THEME_CSS = blockThemeCss(
  parseBlockTheme({
    "heading|.bld-h": {
      weight: "400",
      tracking: "0",
      lineHeight: "1.25",
    },
    "image|.bld-img": {
      radius: "0",
      shadow: "none",
    },
    "text|.bld-text": {
      size: "1",
      lineHeight: "2",
    },
    "button|.bld-btn": {
      caps: "uppercase",
      padX: "1.8",
      padY: "0.8",
      radius: "0",
      weight: "500",
      tracking: "0.1",
    },
    "divider|.bld-hr": {
      color: "var(--site-accent)",
      opacity: "0.5",
      thickness: "1",
    },
    "quote|.bld-quote": {
      bar: "var(--site-accent)",
      size: "1.25",
      style: "italic",
      barWidth: "1",
    },
    "eyebrow|.bld-eyebrow": {
      size: "0.75",
      tracking: "0.18",
    },
    "reviews|.shelf-quote": {
      pad: "1.5",
      radius: "0",
    },
    "shelf|.shelf-row img": {
      radius: "0",
      shadow: "none",
    },
    "carousel|.popular-card-media": {
      radius: "0",
      shadow: "none",
    },
    "looks|.look-editorial-visual": {
      radius: "0",
      shadow: "none",
    },
    "journal|.journal-preview-card": {
      radius: "0",
      shadow: "none",
    },
    "showcase|.bld-collection-card": {
      radius: "0",
      shadow: "none",
    },
  })
);
