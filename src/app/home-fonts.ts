import { Cardo, Hanken_Grotesk } from "next/font/google";

// Only the storefront pages that use the shelf design import this module (home,
// product listings, category and product pages), so these two families are
// preloaded there and not in checkout or admin. The variables are consumed by
// home.css and shop.css.
const display = Cardo({
  weight: ["400", "700"],
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
