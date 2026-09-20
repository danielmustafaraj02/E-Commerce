/**
 * Shared by the catalog scripts (seed-murano-catalog, update-product-descriptions,
 * apply-product-i18n) so a new storefront language is added in one place.
 *
 * Italian is the source language and lives in the plain `name`/`description`
 * columns; every other locale has a `name<Suffix>`/`description<Suffix>` column
 * (see prisma/schema.prisma and src/lib/product-i18n.ts).
 */
export const LOCALE_SUFFIXES = [
  "En",
  "Fr",
  "De",
  "Ar",
  "Zh",
  "Ru",
  "Es",
  "Pt",
  "Hi",
  "Ja",
] as const;
export type LocaleSuffix = (typeof LOCALE_SUFFIXES)[number];

type NameKey = `name${LocaleSuffix}`;
type DescriptionKey = `description${LocaleSuffix}`;

export type ManifestEntry = {
  category: string;
  name: string;
  description: string;
} & { [K in NameKey | DescriptionKey]?: string };

export type ProductTranslationData = { [K in NameKey | DescriptionKey]?: string };
export type CategoryTranslationData = { [K in NameKey]?: string };

// Only the fields the manifest actually has are set: Prisma treats `undefined`
// as "leave this column alone", so a locale missing from the manifest never
// blanks out an existing translation.
export function productTranslations(entry: ManifestEntry): ProductTranslationData {
  const data: ProductTranslationData = {};
  for (const suffix of LOCALE_SUFFIXES) {
    data[`name${suffix}`] = entry[`name${suffix}`];
    data[`description${suffix}`] = entry[`description${suffix}`];
  }
  return data;
}

// Keyed by the Italian category name used in the manifest and the database.
export const CATEGORY_NAMES: Record<string, Record<LocaleSuffix, string>> = {
  Bracciali: {
    En: "Bracelets",
    Fr: "Bracelets",
    De: "Armbänder",
    Ar: "أساور",
    Zh: "手链",
    Ru: "Браслеты",
    Es: "Pulseras",
    Pt: "Pulseiras",
    Hi: "ब्रेसलेट",
    Ja: "ブレスレット",
  },
  Collane: {
    En: "Necklaces",
    Fr: "Colliers",
    De: "Halsketten",
    Ar: "قلادات",
    Zh: "项链",
    Ru: "Колье",
    Es: "Collares",
    Pt: "Colares",
    Hi: "हार",
    Ja: "ネックレス",
  },
  Orecchini: {
    En: "Earrings",
    Fr: "Boucles d'oreilles",
    De: "Ohrringe",
    Ar: "أقراط",
    Zh: "耳环",
    Ru: "Серьги",
    Es: "Pendientes",
    Pt: "Brincos",
    Hi: "झुमके",
    Ja: "ピアス・イヤリング",
  },
};

export function categoryTranslations(nameIt: string): CategoryTranslationData {
  const names = CATEGORY_NAMES[nameIt];
  const data: CategoryTranslationData = {};
  if (!names) return data;
  for (const suffix of LOCALE_SUFFIXES) data[`name${suffix}`] = names[suffix];
  return data;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Finds the manifest entry for a product row. Matching by the Italian name alone
// misses databases where Product.name was later edited to English (as on
// production), so fall back to the English name, then to the slug — the slug is
// "<slugified Italian name>-<6 hex chars>" and never changes.
export function findManifestEntry(
  product: { name: string; slug?: string },
  entries: ManifestEntry[]
): ManifestEntry | undefined {
  const byName = entries.find((entry) => entry.name === product.name);
  if (byName) return byName;
  const byEnglish = entries.find((entry) => entry.nameEn === product.name);
  if (byEnglish) return byEnglish;
  if (product.slug) {
    const prefix = product.slug.replace(/-[0-9a-f]{6}$/i, "");
    return entries.find((entry) => slugify(entry.name) === prefix);
  }
  return undefined;
}
