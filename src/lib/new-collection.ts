import type { Locale } from "@/lib/i18n/locale-constants";

/**
 * The new collection: its own page (/new-collection, linked in the header)
 * showing only the pieces that belong to it, with the shop's usual grid,
 * sorting and filters.
 *
 * Membership is read from the product's web address: every piece of the
 * October 2026 collection was published with "ottobre-2026" in its slug. When
 * the next collection arrives, change `slugMarker` (and the copy below) and
 * the page, its link and its title follow.
 */
export const NEW_COLLECTION = {
  path: "/new-collection",
  slugMarker: "ottobre-2026",
} as const;

export type NewCollectionCopy = {
  /** The header link. */
  nav: string;
  /** The page's heading. */
  title: string;
  /** One line under the heading. */
  intro: string;
  /** The search snippet. */
  metaDescription: (storeName: string) => string;
};

const en: NewCollectionCopy = {
  nav: "New collection",
  title: "The new collection",
  intro: "The pieces that joined the collection in October 2026: new shapes, new shades of glass.",
  metaDescription: (storeName) =>
    `The new ${storeName} collection: Murano glass necklaces, bracelets and earrings added in October 2026.`,
};

const it: NewCollectionCopy = {
  nav: "Nuova collezione",
  title: "La nuova collezione",
  intro: "I gioielli entrati in collezione a ottobre 2026: forme nuove, nuove sfumature di vetro.",
  metaDescription: (storeName) =>
    `La nuova collezione ${storeName}: collane, bracciali e orecchini in vetro di Murano arrivati a ottobre 2026.`,
};

/** Italian and English; every other language reads the English text, the same
 *  fallback as the shop's other page copy (lib/i18n/shop-copy.ts). */
export function getNewCollectionCopy(locale: Locale): NewCollectionCopy {
  return locale === "it" ? it : en;
}
