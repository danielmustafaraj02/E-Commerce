import { getDictionary } from "./dictionaries";
import { defaultLocale, locales, type Locale } from "./locale-constants";
import { getLocale } from "./locale";

export function asLocale(value: string | null | undefined): Locale | null {
  return locales.includes(value as Locale) ? (value as Locale) : null;
}

// The language an email is written in. An order remembers the language it was
// placed in (Order.locale), and that wins; otherwise the visitor's current
// language, which exists when the email is sent from a page or a form. Webhooks
// and cron jobs have no request, so anything else falls back to English.
export async function emailLocale(explicit?: string | null): Promise<Locale> {
  const known = asLocale(explicit);
  if (known) return known;
  try {
    return await getLocale();
  } catch {
    return defaultLocale;
  }
}

export async function emailStrings(explicit?: string | null) {
  const locale = await emailLocale(explicit);
  return { locale, t: getDictionary(locale).emails };
}
