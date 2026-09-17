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
};
type LocalizableProduct = LocalizableName & {
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionDe?: string | null;
};

export function localizedName(item: LocalizableName, locale: Locale): string {
  if (locale === "en") return item.nameEn || item.name;
  if (locale === "fr") return item.nameFr || item.nameEn || item.name;
  if (locale === "de") return item.nameDe || item.nameEn || item.name;
  return item.name;
}

export function localizedDescription(product: LocalizableProduct, locale: Locale): string {
  if (locale === "en") return product.descriptionEn || product.description || "";
  if (locale === "fr") {
    return product.descriptionFr || product.descriptionEn || product.description || "";
  }
  if (locale === "de") {
    return product.descriptionDe || product.descriptionEn || product.description || "";
  }
  return product.description ?? "";
}

// Image search (Google Images, and AI engines that read alt text as a
// signal) rewards a descriptive alt over a bare product name. "Handmade
// Murano glass" is store-specific wording, deliberately baked in here the
// same way as home.heroSubtitle — see that dictionary entry's comment.
export function productImageAlt(name: string, locale: Locale): string {
  switch (locale) {
    case "en":
      return `${name} — handmade Murano glass jewelry`;
    case "fr":
      return `${name} — bijou artisanal en verre de Murano`;
    case "de":
      return `${name} — handgefertigter Schmuck aus Muranoglas`;
    default:
      return `${name} — gioiello artigianale in vetro di Murano`;
  }
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
