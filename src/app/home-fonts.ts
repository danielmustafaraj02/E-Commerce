import { Cardo, Hanken_Grotesk } from "next/font/google";

// Only the storefront pages that use the shelf design import this module (home,
// product listings, category and product pages), so these two families are
// preloaded there and not in checkout or admin. The variables are consumed by
// home.css and shop.css.
// Regular + italic only: headings are set at 400 and nothing uses Cardo
// bold, so the 700 file was a preloaded download competing with the hero.
const display = Cardo({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ui = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const homeFontClasses = `${display.variable} ${ui.variable}`;
