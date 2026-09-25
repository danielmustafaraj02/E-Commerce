import { locales, defaultLocale, type Locale } from "./i18n/locale-constants";

// Real, distinct, independently-crawlable URLs per locale (proxy.ts rewrites
// /xx/<path> internally to the unprefixed route and sets X-Locale — the
// page files themselves never moved). x-default points at the default
// locale's URL, which is also what a bare unprefixed request permanently
// redirects to for a visitor Google can't otherwise classify.
export function hreflangAlternates(unprefixedPath: string): Record<string, string> {
  const path = unprefixedPath === "/" ? "" : unprefixedPath;
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, `/${locale}${path}`])),
    "x-default": `/${defaultLocale}${path}`,
  };
}

// The current page's own canonical URL — self-referencing per locale, as
// distinct from the other 10 languages' versions in hreflangAlternates.
export function localizedCanonical(locale: Locale, unprefixedPath: string): string {
  return `/${locale}${unprefixedPath === "/" ? "" : unprefixedPath}`;
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
