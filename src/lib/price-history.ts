import { formatMoney } from "@/lib/format";

// EU Omnibus Directive (Italy: Codice del Consumo art. 17-bis): an announced
// price reduction must show, as the earlier price, the lowest price applied
// in the 30 days before the reduction. Price history comes from
// ProductPriceChange, which a database trigger fills on every price write.
export const OMNIBUS_REFERENCE_DAYS = 30;

const DAY_MS = 86_400_000;

type PriceChange = { price: number; changedAt: Date };

// The lowest price in effect during the 30 days before the current price took
// effect, or null when there is no earlier price (the price never changed).
export function omnibusReferencePrice(history: PriceChange[]): number | null {
  const sorted = [...history].sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());
  if (sorted.length < 2) return null;

  const current = sorted[sorted.length - 1];
  const windowStart = current.changedAt.getTime() - OMNIBUS_REFERENCE_DAYS * DAY_MS;
  let lowest: number | null = null;
  for (let i = 0; i < sorted.length - 1; i++) {
    // Each price is in effect until the next change.
    if (sorted[i + 1].changedAt.getTime() <= windowStart) continue;
    lowest = lowest === null ? sorted[i].price : Math.min(lowest, sorted[i].price);
  }
  return lowest;
}

// Validates a staff-entered compare-at price against the price being saved.
// `history` is what's stored so far; if `price` differs from the latest entry,
// the save is itself a price change taking effect `now`.
export function compareAtPriceError({
  price,
  compareAtPrice,
  currency,
  history,
  now,
}: {
  price: number;
  compareAtPrice: number;
  currency: string;
  history: PriceChange[];
  now: Date;
}): string | null {
  if (compareAtPrice <= price) return "Compare-at price must be higher than the price";

  const latest = history.reduce<PriceChange | null>(
    (acc, change) => (!acc || change.changedAt > acc.changedAt ? change : acc),
    null
  );
  const withThisSave = latest?.price === price ? history : [...history, { price, changedAt: now }];
  const reference = omnibusReferencePrice(withThisSave);

  if (reference === null || reference <= price) {
    return (
      "This price hasn't been reduced from a higher price in the last 30 days, so it can't " +
      "be shown as a discount (EU Omnibus rule)"
    );
  }
  if (compareAtPrice > reference) {
    return (
      `Compare-at price can be at most ${formatMoney(reference, currency, "en")}, the lowest ` +
      "price in the 30 days before this price took effect (EU Omnibus rule)"
    );
  }
  return null;
}
