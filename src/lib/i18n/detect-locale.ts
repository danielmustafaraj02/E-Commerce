import { locales, defaultLocale, type Locale } from "./locale-constants";

// Framework-agnostic: no next/headers import, so this can run in proxy.ts
// (which gets cookies/headers off the raw NextRequest, not next/headers'
// request-scoped helpers) as well as anywhere else that needs the same
// "which locale does this visitor want" decision from raw string inputs.
export function detectLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | undefined
): Locale {
  if (locales.includes(cookieValue as Locale)) return cookieValue as Locale;

  const lower = (acceptLanguage ?? "").toLowerCase();
  const matched = locales.find((locale) => locale !== "en" && lower.startsWith(locale));
  if (matched) return matched;

  return defaultLocale;
}
