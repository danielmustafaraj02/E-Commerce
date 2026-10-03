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
  pieceCount: (n: number) => (n === 1 ? "1 piece" : `${n} pieces`),
  emptyHint: "Try removing a filter, or start from one of these.",
};

export type ShopCopy = typeof en;

const it: ShopCopy = {
  sortLabel: "Ordina per",
  sortNewest: "Più recenti",
  sortPriceAsc: "Prezzo: dal più basso",
  sortPriceDesc: "Prezzo: dal più alto",
  pieceCount: (n) => (n === 1 ? "1 gioiello" : `${n} gioielli`),
  emptyHint: "Prova a togliere un filtro, oppure parti da qui.",
};

export function getShopCopy(locale: Locale): ShopCopy {
  return locale === "it" ? it : en;
}
