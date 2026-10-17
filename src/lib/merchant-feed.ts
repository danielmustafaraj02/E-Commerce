// Pure helpers for the Google Merchant feed (src/app/api/feeds/google-merchant).

// Google's product taxonomy, by the category names this store uses (Italian
// source names and their translated equivalents). Google accepts the full path as
// text. A category not listed here simply gets no google_product_category
// (Google then classifies the item itself) rather than a wrong one.
const GOOGLE_CATEGORIES: { names: string[]; value: string }[] = [
  {
    names: ["bracciali", "bracelets", "bracelet", "armbanden", "bransoletki", "náramky", "armband", "brățări"],
    value: "Apparel & Accessories > Jewelry > Bracelets",
  },
  {
    names: ["collane", "necklaces", "necklace", "kettingen", "naszyjniki", "náhrdelníky", "halsband", "coliere"],
    value: "Apparel & Accessories > Jewelry > Necklaces",
  },
  { names: ["orecchini", "earrings", "oorbellen", "kolczyki", "náušnice", "örhängen", "cercei"], value: "Apparel & Accessories > Jewelry > Earrings" },
];

export function googleProductCategory(
  category: { name: string; nameEn?: string | null; nameNl?: string | null; namePl?: string | null; nameCs?: string | null; nameSv?: string | null; nameRo?: string | null } | null
): string | null {
  if (!category) return null;
  const candidates = [category.name, category.nameEn ?? "", category.nameNl ?? "", category.namePl ?? "", category.nameCs ?? "", category.nameSv ?? "", category.nameRo ?? ""].map((n) => n.trim().toLowerCase());
  return GOOGLE_CATEGORIES.find((c) => candidates.some((n) => c.names.includes(n)))?.value ?? null;
}

// Google recommends 30–150 characters and keywords in the title; the bare
// product name ("Ruby Necklace") is ~20. The feed is available in English,
// Italian, Dutch, Polish, Czech, Swedish and Romanian (?locale=).
export function feedTitle(name: string, locale: "en" | "it" | "nl" | "pl" | "cs" | "sv" | "ro"): string {
  const suffix = locale === "en"
    ? "Murano Glass Jewelry"
    : locale === "pl"
      ? "Biżuteria ze szkła z Murano"
      : locale === "cs"
        ? "Šperky z muránského skla"
        : locale === "sv"
          ? "Smycken i Muranoglas"
          : locale === "ro"
            ? "Bijuterii din sticlă de Murano"
      : locale === "nl"
      ? "Murano-glazen sieraden"
      : "Gioiello in vetro di Murano";
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
  category: { name: string; nameEn?: string | null; nameNl?: string | null; namePl?: string | null; nameCs?: string | null; nameSv?: string | null; nameRo?: string | null } | null
): string | null {
  return googleProductCategory(category) ? "Glass" : null;
}
