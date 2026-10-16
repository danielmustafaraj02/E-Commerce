import { cache } from "react";
import { cookies, headers } from "next/headers";
import { locale as rootLocale } from "next/root-params";
import { locales, defaultLocale, LOCALE_COOKIE, localeDir, type Locale } from "./locale-constants";
import { detectLocale } from "./detect-locale";

export { locales, defaultLocale, LOCALE_COOKIE, localeDir, type Locale };

// The locale lives in the URL (/en/..., /it/..., ...) as the [locale] root
// segment of the storefront (app/[locale]/layout.tsx). Where that isn't
// available, proxy.ts still passes the segment it found as X-Locale, and the
// cookie/Accept-Language detection (detectLocale) is the last fallback, so
// this never throws or silently defaults to English for a visitor whose
// preference is knowable.
export const getLocale = cache(async (): Promise<Locale> => {
  // Storefront pages: the /[locale] root segment. Reading it doesn't make the
  // page dynamic, so pages stay cacheable — the header/cookie reads below are
  // only reached where root params don't exist (Server Actions, Route
  // Handlers, the unprefixed admin), which are per-request anyway.
  try {
    const fromRoute = await rootLocale();
    if (locales.includes(fromRoute as Locale)) return fromRoute as Locale;
  } catch {
    // not available in this context: fall through
  }

  // headers() throws outside a request scope (some existing Server Action
  // tests mock cookies() but not headers(), for one) — caught rather than
  // left to bubble, per the "never throws" guarantee above.
  let headerStore: Awaited<ReturnType<typeof headers>> | null = null;
  try {
    headerStore = await headers();
  } catch {
    // fall through to cookie/Accept-Language detection below
  }

  const fromHeader = headerStore?.get("x-locale");
  if (locales.includes(fromHeader as Locale)) return fromHeader as Locale;

  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const acceptLanguage = headerStore?.get("accept-language") ?? undefined;
  return detectLocale(fromCookie, acceptLanguage);
});
