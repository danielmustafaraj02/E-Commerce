import type { CSSProperties } from "react";

/**
 * Site style — the eight colour roles and two type roles an admin controls
 * from Settings > Site style, turned into the custom properties the whole
 * storefront already reads.
 *
 * The defaults live in CSS (app/palette.css), not here: a null column means
 * "whatever the theme says", so an untouched store renders exactly as it did
 * before this feature existed, and "restore defaults" writes nulls instead of
 * freezing today's hex values into the database.
 *
 * Nothing in this module touches the database or React — it is pure mapping,
 * so it can be unit-tested and used from both the layout and the admin form's
 * live preview.
 */

/** The colour roles, in the order the admin form shows them. */
export const COLOR_ROLES = [
  "colorBackground",
  "colorSurface",
  "colorText",
  "colorTextMuted",
  "colorPrimary",
  "colorOnPrimary",
  "colorAccent",
  "colorBorder",
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];

/** The CSS custom property each role is published as. */
/* The `--site-*` namespace, deliberately NOT `--color-*`: Tailwind v4 owns
   that prefix in this project's `@theme inline` block (globals.css), where
   --color-background, --color-surface, --color-primary and --color-accent
   already exist and generate the background and text utilities. Publishing the admin
   roles under the same names collided with the framework's own tokens. The
   theme block now points at these instead, so Tailwind utilities follow the
   admin palette too. */
export const CSS_VAR: Record<ColorRole, string> = {
  colorBackground: "--site-bg",
  colorSurface: "--site-surface",
  colorText: "--site-text",
  colorTextMuted: "--site-text-muted",
  colorPrimary: "--site-primary",
  colorOnPrimary: "--site-on-primary",
  colorAccent: "--site-accent",
  colorBorder: "--site-border",
};

/** The palette's own values, for the form's "default" swatch and the contrast
 *  report. These MIRROR app/palette.css — if one changes, change the other. */
export const DEFAULT_COLORS: Record<ColorRole, string> = {
  colorBackground: "#ffffff",
  colorSurface: "#e6e2da",
  colorText: "#154230",
  colorTextMuted: "#6d8579",
  colorPrimary: "#154230",
  colorOnPrimary: "#e6e2da",
  colorAccent: "#a6824a",
  colorBorder: "#ecebe6",
};

export const DEFAULT_FONTS = {
  /* The bundled faces. Empty means "use the role's own webfont", which is
     what --font-heading / --font-body resolve to in globals.css. */
  fontHeading: "",
  fontBody: "",
} as const;

export type SiteStyle = Partial<Record<ColorRole, string | null>> & {
  fontHeading?: string | null;
  fontBody?: string | null;
};

/** Only `#rgb` / `#rrggbb`. Anything else is ignored rather than written into
 *  the page, so a bad value can never inject CSS. */
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** A font family name safe to drop into a CSS value: letters, digits, spaces
 *  and hyphens, quoted. Keeps a stray `;` or `}` out of the stylesheet. */
const FAMILY = /^[\w \-]{1,64}$/;

/**
 * The inline custom properties for <html>. Only roles the admin actually set
 * appear, so every untouched role falls through to the stylesheet's default.
 */
export function siteStyleVars(style: SiteStyle): CSSProperties {
  const vars: Record<string, string> = {};

  for (const role of COLOR_ROLES) {
    const value = style[role];
    if (typeof value === "string" && HEX.test(value.trim())) {
      vars[CSS_VAR[role]] = value.trim().toLowerCase();
    }
  }

  const heading = style.fontHeading?.trim();
  if (heading && FAMILY.test(heading)) vars["--font-heading-family"] = `"${heading}"`;
  const body = style.fontBody?.trim();
  if (body && FAMILY.test(body)) vars["--font-body-family"] = `"${body}"`;

  return vars as CSSProperties;
}

/* ── Contrast ──────────────────────────────────────────────────────────────
   WCAG 2.1 relative luminance and contrast ratio, so the form can say which
   pairings fail rather than leaving an admin to discover it on the page. */

function channel(value: number) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim();
  if (!HEX.test(value)) return null;
  const body = value.slice(1);
  const full =
    body.length === 3
      ? body
          .split("")
          .map((c) => c + c)
          .join("")
      : body;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

export function luminance(hex: string) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio between two hex colours, 1…21. */
export function contrastRatio(a: string, b: string) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** The pairings that actually appear on the page, and the ratio each needs. */
export const CONTRAST_PAIRS: {
  fg: ColorRole;
  bg: ColorRole;
  label: string;
  /** 4.5 for body text, 3 for large display text and UI borders. */
  min: number;
}[] = [
  { fg: "colorText", bg: "colorBackground", label: "Text on background", min: 4.5 },
  { fg: "colorText", bg: "colorSurface", label: "Text on surface", min: 4.5 },
  { fg: "colorTextMuted", bg: "colorBackground", label: "Secondary text on background", min: 4.5 },
  { fg: "colorOnPrimary", bg: "colorPrimary", label: "Label on primary button", min: 4.5 },
  { fg: "colorAccent", bg: "colorBackground", label: "Accent on background", min: 3 },
  { fg: "colorBorder", bg: "colorBackground", label: "Border on background", min: 3 },
];

export type ContrastReport = {
  label: string;
  ratio: number;
  min: number;
  passes: boolean;
};

/** Every pairing's measured ratio, for the admin form's warning list. */
export function contrastReport(colors: Record<ColorRole, string>): ContrastReport[] {
  return CONTRAST_PAIRS.flatMap(({ fg, bg, label, min }) => {
    const ratio = contrastRatio(colors[fg], colors[bg]);
    if (ratio === null) return [];
    return [{ label, ratio: Math.round(ratio * 100) / 100, min, passes: ratio >= min }];
  });
}

/** The effective colour for a role: the admin's value, else the theme default. */
export function resolveColors(style: SiteStyle): Record<ColorRole, string> {
  const out = {} as Record<ColorRole, string>;
  for (const role of COLOR_ROLES) {
    const value = style[role];
    out[role] = typeof value === "string" && HEX.test(value.trim())
      ? value.trim().toLowerCase()
      : DEFAULT_COLORS[role];
  }
  return out;
}
