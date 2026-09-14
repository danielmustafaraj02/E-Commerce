import { cache } from "react";
import { cookies, headers } from "next/headers";

export const locales = ["en", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "locale";

// Cheap on its own, but called independently by the layout and by nearly
// every page — cache() dedupes those to one read per request.
export const getLocale = cache(async (): Promise<Locale> => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (fromCookie === "en" || fromCookie === "it") return fromCookie;

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().startsWith("it")) return "it";

  return defaultLocale;
});
