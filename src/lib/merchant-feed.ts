// Pure helpers for the Google Merchant feed (src/app/api/feeds/google-merchant).

// Google's product taxonomy, by the category names this store uses (Italian
// source names and their English equivalents). Google accepts the full path as
// text. A category not listed here simply gets no google_product_category
// (Google then classifies the item itself) rather than a wrong one.
const GOOGLE_CATEGORIES: { names: string[]; value: string }[] = [
  {
    names: ["bracciali", "bracelets", "bracelet"],
    value: "Apparel & Accessories > Jewelry > Bracelets",
  },
  {
    names: ["collane", "necklaces", "necklace"],
    value: "Apparel & Accessories > Jewelry > Necklaces",
  },
  { names: ["orecchini", "earrings"], value: "Apparel & Accessories > Jewelry > Earrings" },
];

export function googleProductCategory(
  category: { name: string; nameEn?: string | null } | null
): string | null {
  if (!category) return null;
  const candidates = [category.name, category.nameEn ?? ""].map((n) => n.trim().toLowerCase());
  return GOOGLE_CATEGORIES.find((c) => candidates.some((n) => c.names.includes(n)))?.value ?? null;
}

// Google recommends 30–150 characters and keywords in the title; the bare
// product name ("Ruby Necklace") is ~20. The feed is served in English or
// Italian only (?locale=).
export function feedTitle(name: string, locale: "en" | "it"): string {
  const suffix =
    locale === "en" ? "Handmade Murano Glass Jewelry" : "Gioiello in vetro di Murano fatto a mano";
  return `${name} – ${suffix}`.slice(0, 150);
}

// Google allows up to 10 additional images per item.
export const MAX_ADDITIONAL_IMAGES = 10;

// The material for a product, when it can be stated truthfully. Every category
// this store sells (bracelets, necklaces, earrings) is glass-bead jewelry, so
// "Glass" is accurate for them; it deliberately says nothing about Murano
// origin (a separate claim — see the README on the protected "Vetro Artistico
// Murano" mark). Any other category gets none rather than a guess.
export function productMaterial(
  category: { name: string; nameEn?: string | null } | null
): string | null {
  return googleProductCategory(category) ? "Glass" : null;
}
