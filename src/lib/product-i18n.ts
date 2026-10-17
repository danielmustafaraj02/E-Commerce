// Products and categories are catalog data (admin-editable, per-deployment),
// unlike src/lib/i18n/dictionaries.ts which is shared UI chrome — so their
// translations live on the row itself (nameEn/descriptionEn/...) rather than
// in a dictionary. Every helper here falls back through locale -> English ->
// the original Italian field, so a catalog that's only partially translated
// (or a product added without filling in every language) still renders fine.
import type { Locale } from "./i18n/locale";

type LocalizableName = {
  name: string;
  nameEn?: string | null;
  nameFr?: string | null;
  nameDe?: string | null;
  nameAr?: string | null;
  nameZh?: string | null;
  nameRu?: string | null;
  nameEs?: string | null;
  namePt?: string | null;
  nameHi?: string | null;
  nameJa?: string | null;
  nameNl?: string | null;
  namePl?: string | null;
  nameCs?: string | null;
  nameSv?: string | null;
  nameRo?: string | null;
};
type LocalizableProduct = LocalizableName & {
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionDe?: string | null;
  descriptionAr?: string | null;
  descriptionZh?: string | null;
  descriptionRu?: string | null;
  descriptionEs?: string | null;
  descriptionPt?: string | null;
  descriptionHi?: string | null;
  descriptionJa?: string | null;
  descriptionNl?: string | null;
  descriptionPl?: string | null;
  descriptionCs?: string | null;
  descriptionSv?: string | null;
  descriptionRo?: string | null;
  story?: string | null;
  storyEn?: string | null;
  storyNl?: string | null;
  storyPl?: string | null;
  storyCs?: string | null;
  storySv?: string | null;
  storyRo?: string | null;
};

// Every non-English, non-Italian locale falls back to the English field,
// then the original Italian one — this map is just which row field holds
// each locale's own translation.
const NAME_FIELD: Partial<Record<Locale, keyof LocalizableName>> = {
  fr: "nameFr",
  de: "nameDe",
  ar: "nameAr",
  zh: "nameZh",
  ru: "nameRu",
  es: "nameEs",
  pt: "namePt",
  hi: "nameHi",
  ja: "nameJa",
  nl: "nameNl",
  pl: "namePl",
  cs: "nameCs",
  sv: "nameSv",
  ro: "nameRo",
};
const DESCRIPTION_FIELD: Partial<Record<Locale, keyof LocalizableProduct>> = {
  fr: "descriptionFr",
  de: "descriptionDe",
  ar: "descriptionAr",
  zh: "descriptionZh",
  ru: "descriptionRu",
  es: "descriptionEs",
  pt: "descriptionPt",
  hi: "descriptionHi",
  ja: "descriptionJa",
  nl: "descriptionNl",
  pl: "descriptionPl",
  cs: "descriptionCs",
  sv: "descriptionSv",
  ro: "descriptionRo",
};

/** Remove the dated collection suffix from public catalog labels. */
export function catalogDisplayName(name: string): string {
  return name.replace(/\s*(?:[·•|–—-]\s*)?(?:ottobre|ottober|october|octobre|oktober|octubre|outubro)\s+2026\s*$/i, "").trim();
}

export function localizedName(item: LocalizableName, locale: Locale): string {
  const field = NAME_FIELD[locale];
  const name = locale === "it" ? item.name : locale === "en" ? item.nameEn || item.name : (field && item[field]) || item.nameEn || item.name;
  return catalogDisplayName(name);
}

export function localizedDescription(product: LocalizableProduct, locale: Locale): string {
  if (locale === "it") return product.description || product.descriptionEn || "";
  if (locale === "en") return product.descriptionEn || product.description || "";
  const field = DESCRIPTION_FIELD[locale];
  return (field && product[field]) || product.descriptionEn || product.description || "";
}

// Italian and English share the original fields. Dutch, Polish, Czech, Swedish and Romanian have their own story
// column; other locales still fall back to English, then Italian.
export function localizedStory(product: LocalizableProduct, locale: Locale): string {
  if (locale === "it") return product.story || product.storyEn || "";
  if (locale === "nl") return product.storyNl || product.storyEn || product.story || "";
  if (locale === "pl") return product.storyPl || product.storyEn || product.story || "";
  if (locale === "cs") return product.storyCs || product.storyEn || product.story || "";
  if (locale === "sv") return product.storySv || product.storyEn || product.story || "";
  if (locale === "ro") return product.storyRo || product.storyEn || product.story || "";
  return product.storyEn || product.story || "";
}

// Image search (Google Images, and AI engines that read alt text as a
// signal) rewards a descriptive alt over a bare product name. "Murano glass"
// is store-specific wording, deliberately baked in here the same way as
// home.heroSubtitle. English, Italian, Spanish, Arabic, Japanese and Russian no longer say "handmade":
// Perla curates pieces from several makers, and that claim is not verified per
// product (some other languages still carry it; see their translators).
const IMAGE_ALT_SUFFIX: Record<Locale, string> = {
  it: "gioiello in vetro di Murano",
  en: "Murano glass jewelry",
  fr: "bijou en verre de Murano",
  de: "handgefertigter Schmuck aus Muranoglas",
  ar: "مجوهرات من زجاج مورانو",
  zh: "穆拉诺玻璃首饰",
  ru: "украшение из муранского стекла",
  es: "joya de vidrio de Murano",
  pt: "joia artesanal em vidro de Murano",
  hi: "मुरानो ग्लास का आभूषण",
  ja: "ムラーノガラスのジュエリー",
  nl: "Murano-glazen sieraden",
  pl: "biżuteria ze szkła z Murano",
  cs: "šperky z muránského skla",
  sv: "smycken i Muranoglas",
  ro: "bijuterii din sticlă de Murano",
};

export function productImageAlt(name: string, locale: Locale): string {
  return `${name} — ${IMAGE_ALT_SUFFIX[locale]}`;
}

// Applies both of the above to a product-card-shaped object in one call —
// every ProductCard call site needs the same localized name + alt text, so
// this keeps that in one place instead of four near-identical inline maps.
export function localizedCardProduct<
  T extends LocalizableProduct & { images: { url: string; altText: string }[] },
>(product: T, locale: Locale): T {
  const name = localizedName(product, locale);
  return {
    ...product,
    name,
    images: product.images.map((image) => ({ ...image, altText: productImageAlt(name, locale) })),
  };
}
