import { contrastRatio, parseHex, type ColorRole } from "@/lib/site-style";

/**
 * A complete palette from one brand colour. The hue and strength of the colour
 * you pick drive the accent and primary; the page, surface, text and border
 * are tints and shades of the same hue. Every result is checked against the
 * same contrast pairs the site style form warns about, and darkened until it
 * passes, so a generated palette can never put the store below WCAG AA.
 */

export type PaletteVariant = "airy" | "tinted" | "paper";

export const PALETTE_VARIANTS: { id: PaletteVariant; label: string; note: string }[] = [
  { id: "airy", label: "Airy", note: "Near-white page, a hint of your colour" },
  { id: "tinted", label: "Tinted", note: "A softly coloured page and panels" },
  { id: "paper", label: "Warm paper", note: "Cream page, your colour as the accent" },
];

type Hsl = [h: number, s: number, l: number];

function rgbToHsl([r, g, b]: [number, number, number]): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  const hex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Darkens (reduces lightness) until `fg` reaches `min` contrast on `bg`. */
function darkenUntil(h: number, s: number, l: number, bg: string, min: number): string {
  let lightness = l;
  let hex = hslToHex(h, s, lightness);
  for (let i = 0; i < 60 && (contrastRatio(hex, bg) ?? 0) < min; i++) {
    lightness -= 0.01;
    hex = hslToHex(h, s, Math.max(0.02, lightness));
  }
  return hex;
}

export function paletteFromColour(
  brand: string,
  variant: PaletteVariant = "airy"
): Record<ColorRole, string> | null {
  const rgb = parseHex(brand);
  if (!rgb) return null;
  const [h0, s0] = rgbToHsl(rgb);
  const s = clamp(s0, 0.25, 0.85);
  // "Paper" sits on a warm cream, whatever the brand hue is.
  const baseHue = variant === "paper" ? 38 : h0;

  const bgL = variant === "tinted" ? 0.955 : 0.98;
  const surfaceL = variant === "tinted" ? 0.9 : 0.935;
  const colorBackground = hslToHex(baseHue, variant === "paper" ? 0.45 : 0.3, bgL);
  const colorSurface = hslToHex(baseHue, variant === "paper" ? 0.4 : 0.28, surfaceL);
  const colorBorder = hslToHex(baseHue, 0.22, variant === "tinted" ? 0.82 : 0.87);

  const colorText = darkenUntil(h0, 0.45, 0.12, colorSurface, 7);
  const colorTextMuted = darkenUntil(h0, 0.18, 0.4, colorSurface, 4.6);
  // The primary button: your colour, darkened until white reads on it.
  const colorPrimary = darkenUntil(h0, s, 0.34, "#ffffff", 4.6);
  const colorOnPrimary = "#ffffff";
  // The accent: your colour, as bright as still reads on the page.
  const colorAccent = darkenUntil(h0, s, 0.46, colorBackground, 3.2);

  return {
    colorBackground,
    colorSurface,
    colorText,
    colorTextMuted,
    colorPrimary,
    colorOnPrimary,
    colorAccent,
    colorBorder,
  };
}
