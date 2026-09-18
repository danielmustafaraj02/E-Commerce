import { locales, type Locale } from "./i18n/locale-constants";

// Self-referencing hreflang: this site serves every language from the same
// URL (locale is cookie/Accept-Language driven, see src/lib/i18n/locale.ts),
// which is Google's documented "dynamic serving" pattern — same URL for
// every language, paired with a `Vary: Accept-Language` response header
// (see src/proxy.ts). Real locale-prefixed URLs (/en/, /it/, ...) would be a
// stronger signal but are a bigger routing change; this is the correct,
// honest markup for the current architecture.
export function hreflangAlternates(canonicalPath: string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, canonicalPath])),
    "x-default": canonicalPath,
  };
}

// og:locale wants full language_TERRITORY tags, not our bare Locale codes.
const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  it: "it_IT",
  fr: "fr_FR",
  de: "de_DE",
  ar: "ar_AR",
  zh: "zh_CN",
  ru: "ru_RU",
  es: "es_ES",
  pt: "pt_PT",
  hi: "hi_IN",
  ja: "ja_JP",
};

export function ogLocale(locale: Locale): string {
  return OG_LOCALES[locale];
}

// The other locales, for openGraph.alternateLocale (crawlers use this to
// discover the other language versions of the same self-referencing URL).
export function ogAlternateLocales(locale: Locale): string[] {
  return (Object.keys(OG_LOCALES) as Locale[])
    .filter((candidate) => candidate !== locale)
    .map((candidate) => OG_LOCALES[candidate]);
}
