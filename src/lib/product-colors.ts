// A fixed, small palette rather than free text — lets the filter render
// real swatches instead of a text dropdown, and keeps "color" comparable
// across 46 differently-named hand-blown pieces. Every product's `color`
// column (see scripts/set-product-colors.ts) is one of these keys or null.
export type ProductColorKey =
  | "red"
  | "pink"
  | "purple"
  | "blue"
  | "turquoise"
  | "green"
  | "gold"
  | "brown"
  | "black"
  | "white"
  | "silver"
  | "multicolor";

export const PRODUCT_COLOR_KEYS: ProductColorKey[] = [
  "red",
  "pink",
  "purple",
  "blue",
  "turquoise",
  "green",
  "gold",
  "brown",
  "black",
  "white",
  "silver",
  "multicolor",
];

// Swatch fill per color — chosen to read as the actual glass tone, not a
// generic web color (e.g. "gold" is a warm amber-gold, not CSS `gold`).
// "multicolor" gets a conic gradient instead of a flat fill.
export const PRODUCT_COLOR_SWATCH: Record<ProductColorKey, string> = {
  red: "#c0273a",
  pink: "#e0779b",
  purple: "#7b4b94",
  blue: "#2f6fb0",
  turquoise: "#1f9c96",
  green: "#3f8a4e",
  gold: "#c9a227",
  brown: "#8a5a2e",
  black: "#1c1c1c",
  white: "#f5f2ec",
  silver: "#c3c6cb",
  multicolor:
    "conic-gradient(from 0deg, #c0273a, #c9a227, #3f8a4e, #2f6fb0, #7b4b94, #e0779b, #c0273a)",
};

export function isProductColorKey(value: string | null | undefined): value is ProductColorKey {
  return !!value && (PRODUCT_COLOR_KEYS as string[]).includes(value);
}
