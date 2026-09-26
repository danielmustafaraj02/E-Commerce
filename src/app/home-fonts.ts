import { Cormorant_Garamond, DM_Sans } from "next/font/google";

// The brand's two faces, applied on <html> in the root layout so every page
// shares them: Cormorant Garamond for headings and prices, DM Sans for text,
// navigation and controls. Consumed as --font-display / --font-ui.
const display = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ui = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const homeFontClasses = `${display.variable} ${ui.variable}`;
