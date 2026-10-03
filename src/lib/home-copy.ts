/**
 * Admin-editable home page text. The built-in copy lives in the i18n
 * dictionaries; staff can override a whitelisted set of fields per language in
 * Admin > Settings > Page text. An empty/absent override means "use the
 * dictionary", so untouched stores are unchanged and new languages keep working.
 *
 * Stored on StoreSettings.homeCopy as { [locale]: { [fieldKey]: string } }.
 * Pure (no DB/React) so it is unit-testable.
 */
import { locales, type Locale } from "@/lib/i18n/locale-constants";

export type HomeCopyField = {
  /** "<dictionary group>.<key>", e.g. "home.popularTitle". */
  key: string;
  label: string;
  group: string;
  multiline?: boolean;
};

export const HOME_COPY_FIELDS: HomeCopyField[] = [
  { key: "home.heroSubtitle", label: "Hero subtitle", group: "Hero", multiline: true },
  { key: "home.heroCta", label: "Hero button", group: "Hero" },
  { key: "home.popularTitle", label: "Community favourites title", group: "Shelves" },
  { key: "home.bestSellers", label: "Best sellers title", group: "Shelves" },
  { key: "home.newArrivals", label: "New arrivals title", group: "Shelves" },
  { key: "home.newArrivalsIntro", label: "New arrivals intro", group: "Shelves", multiline: true },
  { key: "home.specialSelectionTitle", label: "Special selection title", group: "Shelves" },
  {
    key: "home.specialSelectionSubtitle",
    label: "Special selection subtitle",
    group: "Shelves",
    multiline: true,
  },
  { key: "home.specialSelectionCta", label: "Special selection link", group: "Shelves" },
  { key: "look.kicker", label: "Looks eyebrow", group: "Looks" },
  { key: "looks.title", label: "Looks title", group: "Looks" },
  { key: "home.muranoReason1Title", label: "Reason 1 title", group: "Why Murano" },
  { key: "home.muranoReason1Body", label: "Reason 1 text", group: "Why Murano", multiline: true },
  { key: "home.muranoReason2Title", label: "Reason 2 title", group: "Why Murano" },
  { key: "home.muranoReason2Body", label: "Reason 2 text", group: "Why Murano", multiline: true },
  { key: "home.muranoReason3Title", label: "Reason 3 title", group: "Why Murano" },
  { key: "home.muranoReason3Body", label: "Reason 3 text", group: "Why Murano", multiline: true },
  {
    key: "giftFinder.homeCtaTime",
    label: "Gift finder banner: small line",
    group: "Gift finder banner",
  },
  {
    key: "giftFinder.homeCtaLine",
    label: "Gift finder banner: headline",
    group: "Gift finder banner",
  },
  {
    key: "giftFinder.homeCtaDetails",
    label: "Gift finder banner: details",
    group: "Gift finder banner",
    multiline: true,
  },
  { key: "home.testimonialsTitle", label: "Reviews title", group: "Reviews" },
  { key: "home.newsletterCtaTitle", label: "Newsletter title", group: "Newsletter" },
  { key: "home.newsletterCtaBody", label: "Newsletter text", group: "Newsletter", multiline: true },
  { key: "home.newsletterSubmit", label: "Newsletter button", group: "Newsletter" },
];

export const MAX_COPY_LENGTH = 600;

const FIELD_KEYS = new Set(HOME_COPY_FIELDS.map((f) => f.key));

export type HomeCopy = Partial<Record<Locale, Record<string, string>>>;

/** Stored JSON → clean overrides: known locales and keys, non-empty trimmed strings. */
export function parseHomeCopy(value: unknown): HomeCopy {
  const result: HomeCopy = {};
  if (!value || typeof value !== "object") return result;
  for (const locale of locales) {
    const entry = (value as Record<string, unknown>)[locale];
    if (!entry || typeof entry !== "object") continue;
    const clean: Record<string, string> = {};
    for (const [key, text] of Object.entries(entry as Record<string, unknown>)) {
      if (!FIELD_KEYS.has(key) || typeof text !== "string") continue;
      const trimmed = text.trim().slice(0, MAX_COPY_LENGTH);
      if (trimmed) clean[key] = trimmed;
    }
    if (Object.keys(clean).length > 0) result[locale] = clean;
  }
  return result;
}

/** The dictionary with a locale's overrides applied. Copies only the groups it
 *  touches; the input is never mutated. */
export function applyHomeCopy<D extends Record<string, unknown>>(
  dict: D,
  overrides: Record<string, string> | undefined
): D {
  if (!overrides) return dict;
  const next: Record<string, unknown> = { ...dict };
  for (const [key, text] of Object.entries(overrides)) {
    const [group, name] = key.split(".");
    const current = next[group];
    if (!current || typeof current !== "object" || !(name in (current as object))) continue;
    next[group] = { ...(current as object), [name]: text };
  }
  return next as D;
}
