export function formatMoney(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

// The real percentage off, from the two prices themselves — never a fixed
// label — so it can't drift out of sync with an admin-edited compareAtPrice.
export function formatDiscountPercent(price: number, compareAtPrice: number, locale: string) {
  const ratio = (compareAtPrice - price) / compareAtPrice;
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(
    -ratio
  );
}
