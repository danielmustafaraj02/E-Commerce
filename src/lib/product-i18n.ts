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
};

export function localizedName(item: LocalizableName, locale: Locale): string {
  if (locale === "en") return item.nameEn || item.name;
  const field = NAME_FIELD[locale];
  return (field && item[field]) || item.nameEn || item.name;
}

export function localizedDescription(product: LocalizableProduct, locale: Locale): string {
  if (locale === "en") return product.descriptionEn || product.description || "";
  const field = DESCRIPTION_FIELD[locale];
  return (field && product[field]) || product.descriptionEn || product.description || "";
}

// Image search (Google Images, and AI engines that read alt text as a
// signal) rewards a descriptive alt over a bare product name. "Handmade
// Murano glass" is store-specific wording, deliberately baked in here the
// same way as home.heroSubtitle — see that dictionary entry's comment.
const IMAGE_ALT_SUFFIX: Record<Locale, string> = {
  it: "gioiello artigianale in vetro di Murano",
  en: "handmade Murano glass jewelry",
  fr: "bijou artisanal en verre de Murano",
  de: "handgefertigter Schmuck aus Muranoglas",
  ar: "مجوهرات زجاج مورانو المصنوعة يدويًا",
  zh: "穆拉诺手工玻璃饰品",
  ru: "украшение ручной работы из муранского стекла",
  es: "joya artesanal de vidrio de Murano",
  pt: "joia artesanal em vidro de Murano",
  hi: "मुरानो ग्लास से हाथ से बनी ज्वेलरी",
  ja: "ムラノガラスのハンドメイドジュエリー",
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
