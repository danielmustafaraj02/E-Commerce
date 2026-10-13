import type { Locale } from "./locale";

// Copy for the product listings (/products, /new-collection, /category/*):
// their introductions, toolbar, active filters and empty state. Italian and
// English only for now; every other locale reads the English text, the same
// fallback as look-page-copy.ts. Everything else on the listing (trust line,
// shipping banner, "Only {n} left", review count) reuses dictionary strings.
const en = {
  sortLabel: "Sort by",
  sortNewest: "Newest",
  sortPriceAsc: "Price: low to high",
  sortPriceDesc: "Price: high to low",
  // Short forms for the phone's segmented control (the full ones stay for
  // screen readers and wider screens).
  sortNewestShort: "Newest",
  // Under the price chart: how many pieces the chosen range holds.
  rangeOne: "1 piece in this range",
  rangeMany: "{n} pieces in this range",
  sortPriceAscShort: "Price ↑",
  sortPriceDescShort: "Price ↓",
  pieceCount: (n: number) => (n === 1 ? "1 piece" : `${n} pieces`),
  emptyHint: "Try removing a filter, or start from one of these.",
  // The row of active filters above the grid.
  activeFilters: "Active filters",
  removeFilter: "Remove filter: {x}",
  // One line under the heading, as on the new collection.
  catalogIntro: "Every piece in the shop: Murano glass necklaces, bracelets and earrings, chosen one by one.",
  saleIntro: "The pieces with a reduced price.",
  // Matched on the start of the category's address (collane-in-vetro-di-murano).
  categoryIntros: {
    collane: "Strands of glass beads worn close to the face, from deep ruby to soft sage.",
    bracciali: "Colour and texture around the wrist: glass beads that move with every gesture.",
    orecchini: "Light to wear, with a small flash of colour each time you turn your head.",
  } as Record<string, string>,
};

export type ShopCopy = typeof en;

const it: ShopCopy = {
  sortLabel: "Ordina per",
  sortNewest: "Più recenti",
  sortPriceAsc: "Prezzo: dal più basso",
  sortPriceDesc: "Prezzo: dal più alto",
  sortNewestShort: "Novità",
  rangeOne: "1 gioiello in questa fascia",
  rangeMany: "{n} gioielli in questa fascia",
  sortPriceAscShort: "Prezzo ↑",
  sortPriceDescShort: "Prezzo ↓",
  pieceCount: (n) => (n === 1 ? "1 gioiello" : `${n} gioielli`),
  emptyHint: "Prova a togliere un filtro, oppure parti da qui.",
  activeFilters: "Filtri attivi",
  removeFilter: "Togli il filtro: {x}",
  catalogIntro: "Tutti i gioielli del negozio: collane, bracciali e orecchini in vetro di Murano, scelti uno a uno.",
  saleIntro: "I gioielli con il prezzo ribassato.",
  categoryIntros: {
    collane: "Fili di perle di vetro da portare vicino al viso, dal rosso rubino al verde salvia.",
    bracciali: "Colore e materia intorno al polso: perle di vetro che si muovono a ogni gesto.",
    orecchini: "Leggeri da portare, con un lampo di colore ogni volta che ti volti.",
  },
};

export function getShopCopy(locale: Locale): ShopCopy {
  return locale === "it" ? it : en;
}

/** The category's one-line introduction, if it has one (by its address). */
export function categoryIntro(copy: ShopCopy, slug: string): string | undefined {
  return Object.entries(copy.categoryIntros).find(([prefix]) => slug.startsWith(prefix))?.[1];
}
