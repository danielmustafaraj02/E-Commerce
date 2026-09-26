import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { JournalCategory } from "@/lib/journal/types";

export function categoryLabel(dict: Dictionary["journal"], category: JournalCategory) {
  const labels: Record<JournalCategory, string> = {
    history: dict.catHistory,
    craft: dict.catCraft,
    buying: dict.catBuying,
    care: dict.catCare,
    gifting: dict.catGifting,
  };
  return labels[category];
}

export function formatArticleDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`)
  );
}
