import { db } from "@/lib/db";
import { locales, type Locale } from "@/lib/i18n/locale-constants";

export type MetaDraftRow = {
  title: string;
  description: string;
  ogImageUrl: string;
  noindex: boolean;
};

/** Overrides saved for each page key, grouped by locale, for the admin editors. */
export async function loadPageMeta(keys: string[]) {
  const result: Record<string, Partial<Record<Locale, MetaDraftRow>>> = {};
  try {
    const rows = await db.pageMeta.findMany({ where: { key: { in: keys } } });
    for (const row of rows) {
      if (!(locales as readonly string[]).includes(row.locale)) continue;
      (result[row.key] ??= {})[row.locale as Locale] = {
        title: row.title ?? "",
        description: row.description ?? "",
        ogImageUrl: row.ogImageUrl ?? "",
        noindex: row.noindex,
      };
    }
  } catch {
    // Table not migrated yet: editors start empty.
  }
  return result;
}
