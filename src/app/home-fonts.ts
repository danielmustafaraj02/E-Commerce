import { Cardo, Hanken_Grotesk } from "next/font/google";

// Only the home page imports this module, so these two families are preloaded
// on `/` and nowhere else. The variables are consumed by home.css.
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
