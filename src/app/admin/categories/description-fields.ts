// The per-locale page-description columns on Category, in editor order. Italian
// is the source language and lives in `description`; every other locale falls
// back to English, then Italian (src/lib/product-i18n.ts). Kept out of
// actions.ts because a "use server" module may only export async functions.
export const DESCRIPTION_FIELDS = [
  { key: "description", label: "Italian" },
  { key: "descriptionEn", label: "English" },
  { key: "descriptionFr", label: "French" },
  { key: "descriptionDe", label: "German" },
  { key: "descriptionAr", label: "Arabic", rtl: true },
  { key: "descriptionZh", label: "Chinese" },
  { key: "descriptionRu", label: "Russian" },
  { key: "descriptionEs", label: "Spanish" },
  { key: "descriptionPt", label: "Portuguese" },
  { key: "descriptionHi", label: "Hindi" },
  { key: "descriptionJa", label: "Japanese" },
] as const;

export type DescriptionKey = (typeof DESCRIPTION_FIELDS)[number]["key"];
export type CategoryDescriptions = Record<DescriptionKey, string | null>;

export const DESCRIPTION_MAX = 5000;
