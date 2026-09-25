import { cache } from "react";
import { cookies, headers } from "next/headers";
import { locales, defaultLocale, LOCALE_COOKIE, localeDir, type Locale } from "./locale-constants";
import { detectLocale } from "./detect-locale";

export { locales, defaultLocale, LOCALE_COOKIE, localeDir, type Locale };

// The locale now lives in the URL (/en/..., /it/..., ...): proxy.ts strips
// that segment on every request, rewrites internally to the unprefixed
// route, and sets X-Locale to the segment it found — that's the
// authoritative source here. The cookie/Accept-Language detection
// (detectLocale) only remains as a fallback for a request that somehow
// reaches a page without going through the proxy rewrite (there shouldn't
// be one in production, but static analysis / tests may render a page
// directly), so this never throws or silently defaults to English for a
// visitor whose preference is knowable.
export const getLocale = cache(async (): Promise<Locale> => {
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
