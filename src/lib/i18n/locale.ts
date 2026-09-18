import { cache } from "react";
import { cookies, headers } from "next/headers";
import { locales, defaultLocale, LOCALE_COOKIE, localeDir, type Locale } from "./locale-constants";

export { locales, defaultLocale, LOCALE_COOKIE, localeDir, type Locale };

// Cheap on its own, but called independently by the layout and by nearly
// every page — cache() dedupes those to one read per request.
export const getLocale = cache(async (): Promise<Locale> => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (locales.includes(fromCookie as Locale)) return fromCookie as Locale;

  const acceptLanguage = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  const matched = locales.find((locale) => locale !== "en" && acceptLanguage.startsWith(locale));
  if (matched) return matched;

  return defaultLocale;
});
