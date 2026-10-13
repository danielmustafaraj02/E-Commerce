import { applyHomeCopy, parseHomeCopy } from "@/lib/home-copy";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale-constants";
import type { HeroCopy } from "@/components/hero-concepts/hero-concept";

// The rotation's pause button. Only the two languages the concepts are
// reviewed in so far; every other locale falls back to English.
const HOLD_LABELS: Partial<Record<Locale, { pause: string; play: string; view: string }>> = {
  en: { pause: "Pause the jewellery", play: "Play the jewellery", view: "View the piece" },
  it: { pause: "Metti in pausa i gioielli", play: "Riprendi i gioielli", view: "Vedi il pezzo" },
};

/**
 * The hero's words in one language, from the same sources as the live hero:
 * the store's name, and the subtitle and button text of the home dictionary
 * with the admin's Page text overrides applied.
 */
export function heroCopy(locale: Locale, storeName: string, homeCopy: unknown): HeroCopy {
  const dict = applyHomeCopy(getDictionary(locale), parseHomeCopy(homeCopy)[locale]);
  const hold = HOLD_LABELS[locale] ?? HOLD_LABELS.en!;
  return {
    // Place names, the same in every language.
    eyebrow: "Murano · Venezia",
    title: storeName,
    subtitle: dict.home.heroSubtitle,
    cta: dict.home.heroCta,
    ctaHref: `/${locale}/products`,
    pause: hold.pause,
    play: hold.play,
    view: hold.view,
    soldOut: dict.product.outOfStock,
  };
}
