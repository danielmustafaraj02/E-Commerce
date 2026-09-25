"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { splitLocalePrefix } from "@/lib/i18n/locale-constants";

// Shared by the Link wrapper below and useLocalizedRouter: given the
// locale the CURRENT page is on and a candidate href, add that locale's
// prefix when (and only when) it's a bare internal path that doesn't
// already carry one. External URLs, protocol-relative ("//..."),
// hash/query-only hrefs, and already-prefixed hrefs pass through
// unchanged. With no current locale (unlocalized pages — admin, or
// anywhere usePathname doesn't match a known locale) hrefs are left bare
// too, since there's no locale to add.
function withCurrentLocale(href: string, currentLocale: string | null): string {
  return href.startsWith("/") &&
    !href.startsWith("//") &&
    currentLocale &&
    splitLocalePrefix(href).locale === null
    ? `/${currentLocale}${href}`
    : href;
}

// Drop-in replacement for next/link's Link: every internal href written as
// a bare, unprefixed path ("/products/foo") gets the *current page's*
// locale prefix added automatically, so a click stays on the same language
// instead of round-tripping through proxy.ts's redirect-to-default-locale
// for a bare URL. Reads the locale straight off the current browser URL
// (usePathname reflects the real address bar, unaffected by proxy.ts's
// internal rewrite to the unprefixed route) rather than needing it threaded
// through props, so this works identically whether it's rendered from a
// Server or Client Component parent.
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { locale: currentLocale } = splitLocalePrefix(usePathname());
  const localizedHref = typeof href === "string" ? withCurrentLocale(href, currentLocale) : href;
  return <NextLink href={localizedHref} {...props} />;
}

// Same locale-prefixing for programmatic navigation (router.push/replace)
// as Link does for clicks — needed anywhere a bare path is pushed after an
// action completes (checkout confirmation, "buy now", etc.) rather than
// from a rendered <Link>.
export function useLocalizedRouter() {
  const router = useRouter();
  const { locale: currentLocale } = splitLocalePrefix(usePathname());
  return {
    push: (href: string) => router.push(withCurrentLocale(href, currentLocale)),
    replace: (href: string) => router.replace(withCurrentLocale(href, currentLocale)),
  };
}
