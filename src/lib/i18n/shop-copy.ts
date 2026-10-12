import type { Locale } from "./locale";

// Copy for the /products toolbar and empty state. Italian and English only for
// now; every other locale reads the English text, the same fallback as
// look-page-copy.ts. Everything else on the listing (trust line, shipping
// banner, "Only {n} left", review count) reuses existing dictionary strings.
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
};

export function getShopCopy(locale: Locale): ShopCopy {
  return locale === "it" ? it : en;
}
