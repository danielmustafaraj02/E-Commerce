import { Dancing_Script, Pinyon_Script, Playfair_Display } from "next/font/google";
import type { GiftCardFont } from "@/lib/gift-card";

// The card's typefaces, loaded only where a card is shown (the designer, the
// cart, the admin order page). Serif and Modern reuse the site's own faces.
const script = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--gc-script",
  display: "swap",
});
const classic = Playfair_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin", "cyrillic"],
  variable: "--gc-classic",
  display: "swap",
});
const handwritten = Dancing_Script({
  subsets: ["latin"],
  variable: "--gc-handwritten",
  display: "swap",
});

export const giftCardFontClasses = `${script.variable} ${classic.variable} ${handwritten.variable}`;

export const GIFT_CARD_FONT_FAMILY: Record<GiftCardFont, string> = {
  serif: 'var(--font-display), "Cormorant Garamond", Georgia, serif',
  script: 'var(--gc-script), "Pinyon Script", cursive',
  classic: 'var(--gc-classic), "Playfair Display", Georgia, serif',
  modern: 'var(--font-ui), "DM Sans", system-ui, sans-serif',
  handwritten: 'var(--gc-handwritten), "Dancing Script", cursive',
};
