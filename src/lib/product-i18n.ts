// Products and categories are catalog data (admin-editable, per-deployment),
// unlike src/lib/i18n/dictionaries.ts which is shared UI chrome — so their
// translations live on the row itself (nameEn/descriptionEn) rather than in
// a dictionary. Every helper here falls back to the Italian/original field
// when no translation has been entered yet, so untranslated catalogs (or a
// product added without filling in the English fields) still render fine.
import type { Locale } from "./i18n/locale";

type LocalizableName = { name: string; nameEn?: string | null };
type LocalizableProduct = LocalizableName & {
  description?: string | null;
  descriptionEn?: string | null;
};

export function localizedName(item: LocalizableName, locale: Locale): string {
  if (locale === "en" && item.nameEn) return item.nameEn;
  return item.name;
}

export function localizedDescription(product: LocalizableProduct, locale: Locale): string {
  if (locale === "en" && product.descriptionEn) return product.descriptionEn;
  return product.description ?? "";
}
