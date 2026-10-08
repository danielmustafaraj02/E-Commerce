/**
 * Editorial Look template IDs and labels, including the bold editions.
 *
 * Kept in a pure module (no React, no CSS) because three places need the list:
 * the dispatcher that renders them, the admin preview's selector, and the test
 * that proves every option value maps to a real template. Importing the client
 * component to read them would drag CSS into the test runner.
 */
export const BOLD_TEMPLATE_IDS = [
  "modern-collage-bold",
  "runway-bold",
  "forest-bold",
  "couture-bold",
] as const;

export const EDITORIAL_TEMPLATE_IDS = [
  "xxl",
  "botanical",
  "collage",
  "atelier",
  "runway",
  "collector",
  "botanical-atelier",
  "forest-editorial",
  "botanical-cutout",
  "couture-collage",
  ...BOLD_TEMPLATE_IDS,
] as const;

export type EditorialTemplateId = (typeof EDITORIAL_TEMPLATE_IDS)[number];

/** Human names and a one-line note, for the admin preview's selector. */
export const EDITORIAL_TEMPLATE_META: Record<EditorialTemplateId, { name: string; note: string }> =
  {
    xxl: {
      name: "Editorial XXL",
      note: "Oversized serif title and a dominant jewellery composition",
    },
    botanical: {
      name: "Botanical frame",
      note: "Fine open frame and opposing illustrated branches",
    },
    collage: { name: "Modern collage", note: "Offset cream and ruby panels" },
    atelier: { name: "Quiet Atelier", note: "Ivory ground, cream rails and precise alignment" },
    runway: { name: "Asymmetric runway", note: "Image-dominant spread with offset italic copy" },
    collector: { name: "Gallery", note: "Three ordered product plates with aligned captions" },
    "botanical-atelier": {
      name: "Botanical Atelier",
      note: "Archival botanical strip, white product field, generous serif",
    },
    "forest-editorial": {
      name: "Forest Editorial",
      note: "Ivory jewellery paired with a forest green editorial panel",
    },
    "botanical-cutout": {
      name: "Botanical Cutout",
      note: "White ground and transparent botanical artwork at the edges",
    },
    "couture-collage": {
      name: "Couture Collage",
      note: "Layered paper panels, burgundy strip, olive lines",
    },
    "modern-collage-bold": {
      name: "Modern Collage Bold",
      note: "Oversized title, staggered jewellery, cream disc and burgundy semicircle",
    },
    "runway-bold": {
      name: "Runway Bold",
      note: "Burgundy runway, monumental RUBINO lettering and a clear purchase area",
    },
    "forest-bold": {
      name: "Forest Bold",
      note: "Ivory on forest green, an arched lead plane and botanical margins",
    },
    "couture-bold": {
      name: "Couture Bold",
      note: "Large italic title, overlapping paper cards and burgundy/olive accents",
    },
  };

export const isEditorialTemplateId = (value: string): value is EditorialTemplateId =>
  (EDITORIAL_TEMPLATE_IDS as readonly string[]).includes(value);
