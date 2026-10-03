/**
 * Page builder model: which sections the home page and product pages show, and
 * in what order. Pure (no DB, no React) so the rules are unit-testable; the
 * admin editor and both storefront pages only consume it.
 *
 * Stored as [{ id, visible }] on StoreSettings. Reading always goes through
 * `resolveLayout`, which drops unknown ids, de-duplicates, and appends any
 * section missing from the stored list at its default position — so shipping a
 * new section never requires a data migration and a null column means "default".
 */

export type SectionMeta = { id: string; label: string; hint: string };
export type LayoutEntry = { id: string; visible: boolean };

/** Home page sections below the fixed hero + collections showcase. */
export const HOME_SECTIONS = [
  { id: "popular", label: "Community favourites", hint: "Carousel of pinned or popular pieces" },
  { id: "bestSellers", label: "Best sellers", hint: "Top-selling pieces shelf" },
  { id: "looks", label: "Looks", hint: "Editorial matching sets" },
  { id: "newArrivals", label: "New arrivals", hint: "Latest products" },
  { id: "special", label: "Special selection", hint: "Hand-picked offers" },
  { id: "reasons", label: "Why Murano", hint: "Three reasons with pieces" },
  { id: "faq", label: "FAQ", hint: "Shipping, returns, care" },
  { id: "giftFinder", label: "Gift finder banner", hint: "Call to action to the gift finder" },
  { id: "testimonials", label: "Customer reviews", hint: "Real reviews only" },
  { id: "journal", label: "Journal", hint: "Latest blog articles" },
  { id: "newsletter", label: "Newsletter", hint: "Signup with discount" },
] as const satisfies readonly SectionMeta[];

/** Product page sections below the fixed gallery + buy box. */
export const PRODUCT_SECTIONS = [
  { id: "gift", label: "Gift packaging", hint: "Gift box photo and features" },
  { id: "reviews", label: "Reviews", hint: "Customer reviews and form" },
  { id: "customBlocks", label: "Custom blocks", hint: "Extra text written per product" },
  { id: "story", label: "Story & FAQ", hint: "Why this piece, and questions" },
  { id: "look", label: "Complete the look", hint: "Matching set pieces" },
  { id: "giftCard", label: "Gift card ad", hint: "Personalised gift card promo" },
  { id: "related", label: "You might also like", hint: "Related products" },
] as const satisfies readonly SectionMeta[];

export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];
export type ProductSectionId = (typeof PRODUCT_SECTIONS)[number]["id"];

export const defaultLayout = (sections: readonly SectionMeta[]): LayoutEntry[] =>
  sections.map((s) => ({ id: s.id, visible: true }));

/** Stored value (anything) + the known sections → a complete, valid layout. */
export function resolveLayout(stored: unknown, sections: readonly SectionMeta[]): LayoutEntry[] {
  const known = new Set(sections.map((s) => s.id));
  const seen = new Set<string>();
  const result: LayoutEntry[] = [];
  if (Array.isArray(stored)) {
    for (const item of stored) {
      if (!item || typeof item !== "object") continue;
      const { id, visible } = item as { id?: unknown; visible?: unknown };
      if (typeof id !== "string" || !known.has(id) || seen.has(id)) continue;
      seen.add(id);
      result.push({ id, visible: visible !== false });
    }
  }
  for (const s of sections) if (!seen.has(s.id)) result.push({ id: s.id, visible: true });
  return result;
}

/** The ids to render, in order, skipping hidden ones (and any `extraHidden`). */
export function visibleOrder(
  stored: unknown,
  sections: readonly SectionMeta[],
  extraHidden: readonly string[] = []
): string[] {
  return resolveLayout(stored, sections)
    .filter((entry) => entry.visible && !extraHidden.includes(entry.id))
    .map((entry) => entry.id);
}

export type CustomBlock = { title: string; body: string };
export type ProductPageLayout = { hidden: string[]; blocks: CustomBlock[] };

export const MAX_CUSTOM_BLOCKS = 6;
export const MAX_BLOCK_TITLE = 80;
export const MAX_BLOCK_BODY = 2000;

/** Per-product overrides from the JSON column; tolerant of null / bad shapes. */
export function parseProductPageLayout(value: unknown): ProductPageLayout {
  const empty: ProductPageLayout = { hidden: [], blocks: [] };
  if (!value || typeof value !== "object") return empty;
  const { hidden, blocks } = value as { hidden?: unknown; blocks?: unknown };
  const known = new Set<string>(PRODUCT_SECTIONS.map((s) => s.id));
  return {
    hidden: Array.isArray(hidden)
      ? hidden.filter((id): id is string => typeof id === "string" && known.has(id))
      : [],
    blocks: Array.isArray(blocks)
      ? blocks
          .flatMap((b) => {
            if (!b || typeof b !== "object") return [];
            const { title, body } = b as { title?: unknown; body?: unknown };
            if (typeof title !== "string" || typeof body !== "string") return [];
            const t = title.trim().slice(0, MAX_BLOCK_TITLE);
            const text = body.trim().slice(0, MAX_BLOCK_BODY);
            return t || text ? [{ title: t, body: text }] : [];
          })
          .slice(0, MAX_CUSTOM_BLOCKS)
      : [],
  };
}

export type LayoutPreset = {
  id: string;
  name: string;
  description: string;
  /** Section ids in order; any section not listed is hidden. */
  order: string[];
};

/** One-click starting points in the editor. Not stored: applying one just fills
 *  the draft, which the admin can still tweak before saving. */
export const HOME_PRESETS: LayoutPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The built-in order, everything on.",
    order: HOME_SECTIONS.map((s) => s.id),
  },
  {
    id: "shop-first",
    name: "Shop first",
    description: "Products up front, storytelling after.",
    order: ["newArrivals", "bestSellers", "popular", "special", "looks", "reasons", "testimonials", "faq", "newsletter"],
  },
  {
    id: "story-first",
    name: "Story first",
    description: "Brand and trust before the shelves.",
    order: ["reasons", "looks", "popular", "journal", "bestSellers", "newArrivals", "testimonials", "giftFinder", "faq", "newsletter"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Short page: favourites, best sellers, newsletter.",
    order: ["popular", "bestSellers", "newsletter"],
  },
];

export const PRODUCT_PRESETS: LayoutPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The built-in order, everything on.",
    order: PRODUCT_SECTIONS.map((s) => s.id),
  },
  {
    id: "conversion",
    name: "Conversion",
    description: "Reviews and story first, related products right after.",
    order: ["reviews", "customBlocks", "story", "related", "look", "gift"],
  },
  {
    id: "gifting",
    name: "Gifting",
    description: "Lead with the gift box and gift card.",
    order: ["gift", "giftCard", "customBlocks", "story", "reviews", "look", "related"],
  },
  {
    id: "lean",
    name: "Lean",
    description: "Only reviews and related products.",
    order: ["reviews", "related"],
  },
];

/** Preset → full layout: its sections first, visible; the rest appended hidden. */
export function layoutFromPreset(preset: LayoutPreset, sections: readonly SectionMeta[]): LayoutEntry[] {
  const listed = preset.order.filter((id) => sections.some((s) => s.id === id));
  const rest = sections.filter((s) => !listed.includes(s.id));
  return [
    ...listed.map((id) => ({ id, visible: true })),
    ...rest.map((s) => ({ id: s.id, visible: false })),
  ];
}
