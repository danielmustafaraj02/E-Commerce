// Pure constants only — no next/headers import. Kept separate from
// locale.ts so a Client Component can import `locales`/`Locale` as a value
// (e.g. to render a list of language buttons) without pulling
// next/headers's cookies()/headers() into the client bundle, which Next.js
// refuses to build.
export const locales = ["en", "it", "fr", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "locale";
