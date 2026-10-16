"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, locales, type Locale } from "./locale";

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // Nothing to revalidate: the page's language is its URL (/it/…), and the
  // switcher navigates there. Revalidating here would throw away every
  // cached page for every visitor each time one of them changed language.
}
