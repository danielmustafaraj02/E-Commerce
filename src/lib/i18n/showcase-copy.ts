import type { Locale } from "./locale";

/**
 * Copy for the homepage scroll-driven collection showcase.
 *
 * Italian and English only for now; every other locale reads the English text,
 * the same way look-page copy falls back (lib/i18n/look-page-copy.ts). The
 * category names themselves are NOT defined here — they come from the database
 * (categories.name / nameEn), so a category renamed in the admin shows the new
 * name here automatically. Only the supporting description and the link label
 * live in this file.
 */

export type ShowcaseScene = "necklace" | "bracelet" | "earrings";

/** Which scene each category slug prefix belongs to, in showcase order. */
export const SHOWCASE_SCENE_ORDER: readonly ShowcaseScene[] = [
  "necklace",
  "bracelet",
  "earrings",
] as const;

/* The descriptions are a single editorial line each — a styling benefit stated
   as briefly as it can be, because the showcase gives the reader one line of
   type beside a very large photograph and anything longer competes with it.
   Deliberately free of claims about origin, craftsmanship, materials or
   uniqueness: those are per-product facts held in the catalogue, and a category
   block cannot assert them for every product underneath it. The category NAMES
   are not here — they come from the database. */
const en = {
  scenes: {
    necklace: {
      description: "Worn close to the face, where the colour of the glass meets your own.",
      cta: "See the necklaces",
    },
    bracelet: {
      description: "Colour and texture gathered around the wrist, moving with every gesture.",
      cta: "See the bracelets",
    },
    earrings: {
      description: "Light enough for a whole day, with a flash of colour each time you turn your head.",
      cta: "See the earrings",
    },
  },
};

const it: typeof en = {
  scenes: {
    necklace: {
      description: "Si porta vicino al viso, dove il colore del vetro incontra il tuo.",
      cta: "Guarda le collane",
    },
    bracelet: {
      description: "Colore e materia raccolti intorno al polso, in movimento a ogni gesto.",
      cta: "Guarda i bracciali",
    },
    earrings: {
      description: "Leggeri per un giorno intero, con un lampo di colore ogni volta che ti volti.",
      cta: "Guarda gli orecchini",
    },
  },
};

export type ShowcaseCopy = typeof en;

export function getShowcaseCopy(locale: Locale): ShowcaseCopy {
  return locale === "it" ? it : en;
}