import { DEFAULT_COLORS, type ColorRole } from "@/lib/site-style";

/**
 * Named colour palettes for Admin > Settings > Site style.
 *
 * Sourced from the "elegant" popular list on coolors.co, each a five-colour
 * palette mapped onto this site's eight roles: lightest becomes the
 * background, next lightest the surface, darkest the text and the primary,
 * the most saturated remaining colour the accent, and the secondary text and
 * the border are mixed from those so they sit on the same ramp.
 *
 * Every palette here was CHECKED, not just converted: each one clears WCAG AA
 * on text over background, text over surface, secondary text over background
 * and the label on the primary button, and 3:1 on the accent. Of the 42
 * palettes on that page, 34 were dropped — some for a background too dark or
 * too saturated to read as a store's page, some because their only candidate
 * accent was indistinguishable from the body text.
 *
 * A palette sets all eight roles at once and the admin can then edit any of
 * them by hand; doing so simply makes the selector read "Custom".
 */

export type ColorPalette = {
  id: string;
  name: string;
  note: string;
  colors: Record<ColorRole, string>;
};

/** The site's own palette, for the "no override" entry in the selector. */
export const THEME_PALETTE = {
  id: "theme",
  name: "Perla (site default)",
  note: "Bottle green, bronze and linen — the brand's own",
  colors: DEFAULT_COLORS,
} as const;

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "onyx-navy",
    name: "Onyx & Navy",
    note: "Crisp monochrome with a deep navy accent",
    /* coolors.co "elegant": #000000 #14213d #fca311 #e5e5e5 #ffffff */
    colors: {
      colorBackground: "#ffffff",
      colorSurface: "#e5e5e5",
      colorText: "#000000",
      colorTextMuted: "#737373",
      colorPrimary: "#000000",
      colorOnPrimary: "#ffffff",
      colorAccent: "#14213d",
      colorBorder: "#f1f1f1",
    },
  },
  {
    id: "oatmeal-ink",
    name: "Oatmeal & Ink",
    note: "Warm neutral ground, violet-ink type",
    /* coolors.co "elegant": #22223b #4a4e69 #9a8c98 #c9ada7 #f2e9e4 */
    colors: {
      colorBackground: "#f2e9e4",
      colorSurface: "#c9ada7",
      colorText: "#22223b",
      colorTextMuted: "#605e6e",
      colorPrimary: "#22223b",
      colorOnPrimary: "#ffffff",
      colorAccent: "#4a4e69",
      colorBorder: "#dbc8c2",
    },
  },
  {
    id: "slate-prussian",
    name: "Slate & Prussian",
    note: "Soft graphite on white, Prussian blue accent",
    /* coolors.co "elegant": #353535 #3c6e71 #ffffff #d9d9d9 #284b63 */
    colors: {
      colorBackground: "#ffffff",
      colorSurface: "#d9d9d9",
      colorText: "#353535",
      colorTextMuted: "#727272",
      colorPrimary: "#353535",
      colorOnPrimary: "#ffffff",
      colorAccent: "#284b63",
      colorBorder: "#eaeaea",
    },
  },
  {
    id: "sand-plum",
    name: "Sand & Plum",
    note: "Sand ground with plum and rosewood",
    /* coolors.co "elegant": #bfb5af #ece2d0 #d5b9b2 #a26769 #582c4d */
    colors: {
      colorBackground: "#ece2d0",
      colorSurface: "#d5b9b2",
      colorText: "#582c4d",
      colorTextMuted: "#765067",
      colorPrimary: "#582c4d",
      colorOnPrimary: "#ffffff",
      colorAccent: "#a26769",
      colorBorder: "#dfcbc0",
    },
  },
  {
    id: "porcelain-teal",
    name: "Porcelain & Teal",
    note: "Porcelain white, near-black type, teal accent",
    /* coolors.co "elegant": #050505 #1b9aaa #dddbcb #f5f1e3 #ffffff */
    colors: {
      colorBackground: "#ffffff",
      colorSurface: "#f5f1e3",
      colorText: "#050505",
      colorTextMuted: "#696969",
      colorPrimary: "#050505",
      colorOnPrimary: "#ffffff",
      colorAccent: "#1b9aaa",
      colorBorder: "#faf7f0",
    },
  },
  {
    id: "blush-cocoa",
    name: "Blush & Cocoa",
    note: "Pale blush ground, cocoa type, taupe accent",
    /* coolors.co "elegant": #d1ccdc #424c55 #f5edf0 #886f68 #3d2c2e */
    colors: {
      colorBackground: "#f5edf0",
      colorSurface: "#d1ccdc",
      colorText: "#3d2c2e",
      colorTextMuted: "#746668",
      colorPrimary: "#3d2c2e",
      colorOnPrimary: "#ffffff",
      colorAccent: "#886f68",
      colorBorder: "#e1dbe5",
    },
  },
  {
    id: "ivory-aubergine",
    name: "Ivory & Aubergine",
    note: "Ivory ground with aubergine and mauve",
    /* coolors.co "elegant": #ffffff #412234 #6d466b #b49fcc #ead7d7 */
    colors: {
      colorBackground: "#ffffff",
      colorSurface: "#ead7d7",
      colorText: "#412234",
      colorTextMuted: "#846f7b",
      colorPrimary: "#412234",
      colorOnPrimary: "#ffffff",
      colorAccent: "#6d466b",
      colorBorder: "#f3e9e9",
    },
  },
  {
    id: "eucalyptus-garnet",
    name: "Eucalyptus & Garnet",
    note: "Eucalyptus grey-green with bordeaux and garnet",
    /* coolors.co "elegant": #dce0d9 #31081f #6b0f1a #595959 #808f85 */
    colors: {
      colorBackground: "#dce0d9",
      colorSurface: "#808f85",
      colorText: "#31081f",
      colorTextMuted: "#6d5460",
      colorPrimary: "#31081f",
      colorOnPrimary: "#ffffff",
      colorAccent: "#6b0f1a",
      colorBorder: "#a9b3ab",
    },
  },];

/** The palette whose eight roles exactly match what is set, if any. */
export function findPalette(colors: Partial<Record<ColorRole, string | null>>) {
  const keys = Object.keys(DEFAULT_COLORS) as ColorRole[];
  const same = (p: Record<ColorRole, string>) =>
    keys.every(
      (k) => (colors[k] ?? "").trim().toLowerCase() === p[k].toLowerCase()
    );
  return COLOR_PALETTES.find((p) => same(p.colors)) ?? null;
}
