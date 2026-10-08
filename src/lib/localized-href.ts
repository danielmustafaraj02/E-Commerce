import { splitLocalePrefix } from "./i18n/locale-constants";

export function withCurrentLocale(href: string, currentLocale: string | null): string {
  // Admin is a separate, unlocalized backend, including when linked from
  // a localized storefront or a legacy locale-prefixed admin URL.
  const { rest } = splitLocalePrefix(href);
  if (/^\/admin(?:[/?#]|$)/.test(rest)) return rest;

  return href.startsWith("/") &&
    !href.startsWith("//") &&
    currentLocale &&
    splitLocalePrefix(href).locale === null
    ? `/${currentLocale}${href}`
    : href;
}
