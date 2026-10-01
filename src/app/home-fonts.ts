import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

/**
 * The site's faces, applied on <html> in the root layout so every page and
 * every locale shares them. Three ROLES, at most one family each:
 *
 *   --font-heading   headings and display copy   NewYork
 *   --font-body      running text                DM Sans
 *   --font-ui        controls, labels, buttons   DM Sans
 *
 * Two families cover the three roles today, which is the brief's starting
 * point: text and UI deliberately share one sans.
 *
 * NewYork is the free serif by ARTEM NEVSKY
 * (https://freedesignresources.net/newyork-free-serif-typeface/) — NOT Apple's
 * system font of the same name, which this file used to reach for through
 * --font-chrome and which only ever appeared on Apple devices anyway.
 * It is hosted locally (public/fonts/newyork, see LICENSE.txt there for its
 * provenance and the two licence caveats) and served as WOFF2.
 */
const heading = localFont({
  /* One file, because the family HAS one real weight. No bold and no italic
     are declared, so a browser is never invited to synthesise either. */
  src: [{ path: "../../public/fonts/newyork/NewYork-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-heading",
  display: "swap",
  /* Metric-ish fallbacks in the same key: a high-contrast Didone-ish serif,
     so the swap moves the text as little as possible. */
  fallback: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const homeFontClasses = `${heading.variable} ${body.variable}`;
