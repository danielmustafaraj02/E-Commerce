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
 * The second group (Lagoon & Mist onwards) was written for this shop's kind of
 * store (jewellery, gifts, handmade) and checked the same way.
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
  },
  {
    id: "lagoon-mist",
    name: "Lagoon & Mist",
    note: "Airy white with lagoon teal",
    colors: {
      colorBackground: "#f7fbfa",
      colorSurface: "#e1efee",
      colorText: "#0f2f35",
      colorTextMuted: "#4d6a70",
      colorPrimary: "#0f4c5c",
      colorOnPrimary: "#ffffff",
      colorAccent: "#1b7f8c",
      colorBorder: "#cfe3e1",
    },
  },
  {
    id: "rosegold-plum",
    name: "Rose Gold & Plum",
    note: "Blush ground, plum type, rose-gold accent",
    colors: {
      colorBackground: "#fdf6f3",
      colorSurface: "#f4e1da",
      colorText: "#3b2326",
      colorTextMuted: "#7a5a5d",
      colorPrimary: "#7a3e48",
      colorOnPrimary: "#ffffff",
      colorAccent: "#a85f6b",
      colorBorder: "#ead3cb",
    },
  },
  {
    id: "emerald-cream",
    name: "Emerald & Cream",
    note: "Cream ground with deep emerald",
    colors: {
      colorBackground: "#fbf8f1",
      colorSurface: "#eae3d2",
      colorText: "#10281f",
      colorTextMuted: "#4f6359",
      colorPrimary: "#0b5d3b",
      colorOnPrimary: "#ffffff",
      colorAccent: "#0f7a4d",
      colorBorder: "#d9d1bd",
    },
  },
  {
    id: "terracotta-linen",
    name: "Terracotta & Linen",
    note: "Linen ground with baked terracotta",
    colors: {
      colorBackground: "#faf5ee",
      colorSurface: "#e9e4d3",
      colorText: "#3a2a20",
      colorTextMuted: "#6c5a4c",
      colorPrimary: "#8c4a2f",
      colorOnPrimary: "#ffffff",
      colorAccent: "#b85d36",
      colorBorder: "#dfd6c3",
    },
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    note: "Soft lilac ground, indigo type",
    colors: {
      colorBackground: "#faf8fd",
      colorSurface: "#ece6f5",
      colorText: "#2a2140",
      colorTextMuted: "#62597a",
      colorPrimary: "#4b3b7a",
      colorOnPrimary: "#ffffff",
      colorAccent: "#7054b8",
      colorBorder: "#dcd3ec",
    },
  },
  {
    id: "champagne-noir",
    name: "Champagne & Noir",
    note: "Champagne ground, black type, antique gold",
    colors: {
      colorBackground: "#fbf7ef",
      colorSurface: "#efe5d0",
      colorText: "#1c1a17",
      colorTextMuted: "#5d574b",
      colorPrimary: "#1c1a17",
      colorOnPrimary: "#f7f1e3",
      colorAccent: "#8a6d1f",
      colorBorder: "#e3d8bf",
    },
  },
  {
    id: "coastal-blue",
    name: "Coastal Blue",
    note: "Sea-spray white with marine blue",
    colors: {
      colorBackground: "#f6fafd",
      colorSurface: "#e2eef7",
      colorText: "#0e2238",
      colorTextMuted: "#4a6178",
      colorPrimary: "#1d4e89",
      colorOnPrimary: "#ffffff",
      colorAccent: "#2a6fb0",
      colorBorder: "#cfe0ee",
    },
  },
  {
    id: "burgundy-blush",
    name: "Burgundy & Blush",
    note: "Pale blush ground, burgundy and wine",
    colors: {
      colorBackground: "#fdf7f7",
      colorSurface: "#f3dede",
      colorText: "#3a1018",
      colorTextMuted: "#7a4a52",
      colorPrimary: "#6d1a2b",
      colorOnPrimary: "#ffffff",
      colorAccent: "#a32a44",
      colorBorder: "#ebcfd2",
    },
  },
  {
    id: "forest-moss",
    name: "Forest & Moss",
    note: "Pale moss ground, forest green",
    colors: {
      colorBackground: "#f6f8f2",
      colorSurface: "#e3e9d6",
      colorText: "#1d2a17",
      colorTextMuted: "#55664a",
      colorPrimary: "#2f4a24",
      colorOnPrimary: "#ffffff",
      colorAccent: "#4d7a2c",
      colorBorder: "#d3dcc2",
    },
  },
  {
    id: "sunset-amber",
    name: "Sunset Amber",
    note: "Warm ivory with amber and burnt orange",
    colors: {
      colorBackground: "#fffaf2",
      colorSurface: "#fbe9cf",
      colorText: "#3a2208",
      colorTextMuted: "#7a5a2c",
      colorPrimary: "#8a4b08",
      colorOnPrimary: "#ffffff",
      colorAccent: "#b35f08",
      colorBorder: "#f0d9b4",
    },
  },
  {
    id: "graphite-mint",
    name: "Graphite & Mint",
    note: "Cool white, graphite type, mint accent",
    colors: {
      colorBackground: "#f8faf9",
      colorSurface: "#e4ece9",
      colorText: "#1e2a28",
      colorTextMuted: "#566562",
      colorPrimary: "#26403b",
      colorOnPrimary: "#ffffff",
      colorAccent: "#2a7f69",
      colorBorder: "#d4dfdb",
    },
  },
  {
    id: "pearl-slate",
    name: "Pearl & Slate",
    note: "Pearl grey with slate and periwinkle",
    colors: {
      colorBackground: "#f9f9fb",
      colorSurface: "#e8e9ef",
      colorText: "#23252e",
      colorTextMuted: "#5d6070",
      colorPrimary: "#3a3f58",
      colorOnPrimary: "#ffffff",
      colorAccent: "#5f6ea0",
      colorBorder: "#d9dbe4",
    },
  },
  {
    id: "poppy-ink",
    name: "Poppy & Ink",
    note: "Warm white, ink type, poppy red",
    colors: {
      colorBackground: "#fffdf8",
      colorSurface: "#f6ead9",
      colorText: "#15181f",
      colorTextMuted: "#55596a",
      colorPrimary: "#15181f",
      colorOnPrimary: "#ffffff",
      colorAccent: "#c93a25",
      colorBorder: "#ece0cc",
    },
  },
  {
    id: "olive-linen",
    name: "Olive & Linen",
    note: "Linen ground with olive and moss",
    colors: {
      colorBackground: "#faf8f2",
      colorSurface: "#ebe7d6",
      colorText: "#2b2a1c",
      colorTextMuted: "#67654f",
      colorPrimary: "#5a5a2a",
      colorOnPrimary: "#ffffff",
      colorAccent: "#737326",
      colorBorder: "#ddd8c0",
    },
  },
  {
    id: "turquoise-coral",
    name: "Turquoise & Coral",
    note: "Fresh white, deep turquoise, coral accent",
    colors: {
      colorBackground: "#f7fcfc",
      colorSurface: "#dff1f0",
      colorText: "#10343a",
      colorTextMuted: "#4c6f74",
      colorPrimary: "#0e6b73",
      colorOnPrimary: "#ffffff",
      colorAccent: "#c9503a",
      colorBorder: "#c9e2e0",
    },
  },
  {
    id: "ocean-sand",
    name: "Ocean & Sand",
    note: "Sand ground with deep ocean blue",
    colors: {
      colorBackground: "#fbf9f4",
      colorSurface: "#e8e1d1",
      colorText: "#0d2b3e",
      colorTextMuted: "#4b6172",
      colorPrimary: "#14506e",
      colorOnPrimary: "#ffffff",
      colorAccent: "#1e7a99",
      colorBorder: "#d8d0bd",
    },
  },
];

/* ── Palettes the admin saved themselves ──────────────────────────────────
   Stored on the settings row as JSON. They behave exactly like the built-in
   ones in the selector; the only differences are that they can be deleted and
   that nothing guarantees their contrast, which is why the form shows the
   same warnings for them that it shows for hand-edited colours. */

export type CustomPalette = {
  id: string;
  name: string;
  colors: Record<ColorRole, string>;
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Read custom palettes out of whatever the JSON column holds.
 *
 * Written defensively on purpose: the column is JSON, so it can contain
 * anything an older version of this code (or a hand-edited row) left there.
 * Anything that is not a complete, well-formed palette is dropped rather than
 * being allowed to reach a style attribute.
 */
export function parseCustomPalettes(value: unknown): CustomPalette[] {
  if (!Array.isArray(value)) return [];
  const roles = Object.keys(DEFAULT_COLORS) as ColorRole[];
  const out: CustomPalette[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const id = typeof e.id === "string" ? e.id : null;
    const name = typeof e.name === "string" ? e.name.trim() : "";
    const colors = e.colors as Record<string, unknown> | undefined;
    if (!id || !name || !colors || typeof colors !== "object") continue;
    if (!roles.every((r) => typeof colors[r] === "string" && HEX.test(colors[r] as string))) {
      continue;
    }
    out.push({
      id,
      name,
      colors: Object.fromEntries(
        roles.map((r) => [r, (colors[r] as string).toLowerCase()])
      ) as Record<ColorRole, string>,
    });
  }
  return out;
}

/** The palette whose eight roles exactly match what is set, if any. */
export function findPalette(
  colors: Partial<Record<ColorRole, string | null>>,
  custom: CustomPalette[] = []
) {
  const keys = Object.keys(DEFAULT_COLORS) as ColorRole[];
  const same = (p: Record<ColorRole, string>) =>
    keys.every((k) => (colors[k] ?? "").trim().toLowerCase() === p[k].toLowerCase());
  /* The admin's own palettes are searched first: if a saved palette happens
     to match a bundled one, the one they named is the one to show. */
  return custom.find((p) => same(p.colors)) ?? COLOR_PALETTES.find((p) => same(p.colors)) ?? null;
}
