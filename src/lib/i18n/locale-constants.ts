// Pure constants only — no next/headers import. Kept separate from
// locale.ts so a Client Component can import `locales`/`Locale` as a value
// (e.g. to render a list of language buttons) without pulling
// next/headers's cookies()/headers() into the client bundle, which Next.js
// refuses to build.
export const locales = ["en", "it", "fr", "de", "ar", "zh", "ru", "es", "pt", "hi", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "locale";

const LOCALE_PREFIX_RE = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

// The one place this regex is built — proxy.ts, the localized Link wrapper,
// and any client component comparing usePathname() against a bare route
// (e.g. "is this the /cart page?") all need the same "what locale, and what
// page underneath it" split, done the same way.
export function splitLocalePrefix(pathname: string): { locale: Locale | null; rest: string } {
  const match = pathname.match(LOCALE_PREFIX_RE);
  if (!match) return { locale: null, rest: pathname };
  return { locale: match[1] as Locale, rest: pathname.slice(match[0].length) || "/" };
}

// Arabic reads right-to-left; every other supported locale is LTR. Used for
// <html dir> (layout.tsx) — this switches text direction/alignment
// correctly everywhere via the browser's own bidi handling, but the site's
// own layout (flex/grid ordering, icon placement, etc.) is not mirrored for
// RTL — a fuller RTL pass would need to audit those separately.
export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
