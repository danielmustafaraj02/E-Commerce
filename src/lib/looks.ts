// "Complete the look": a Look is a set of matching pieces (necklace, bracelet,
// earrings) that staff group in Admin > Looks. Buying every piece together
// takes Look.discountPercent off each of them. Pure and dependency-free so the
// product page, the cart estimate and checkout (lib/pricing.ts) share the math.

export const LOOK_SIZE = 3;

// Any two different pieces of a look bought together: a smaller saving than
// the full set (never more than the look's own set discount).
export const PAIR_DISCOUNT_PERCENT = 10;

// Rounded per piece, exactly as bundleDiscounts applies it at checkout, so the
// advertised set price is the price charged.
function pieceSaving(price: number, discountPercent: number) {
  return Math.round((price * discountPercent) / 100);
}

export function lookPricing(prices: number[], discountPercent: number) {
  const individualTotal = prices.reduce((sum, price) => sum + price, 0);
  const saving = prices.reduce((sum, price) => sum + pieceSaving(price, discountPercent), 0);
  return { individualTotal, setTotal: individualTotal - saving, saving };
}

export type LookRule = { id: string; discountPercent: number; productIds: string[] };
type CartLine = { productId: string; price: number; quantity: number };

// Discount for each complete set of a look in the cart (min quantity across
// its pieces) at the look's percentage, then for each remaining pair of two
// different pieces at PAIR_DISCOUNT_PERCENT. Extra single pieces stay full price.
export function bundleDiscounts(lines: CartLine[], looks: LookRule[]) {
  const byProduct: Record<string, number> = {};
  const lookIds: string[] = [];
  let total = 0;

  const discount = (piece: CartLine, percent: number, count: number) => {
    const amount = pieceSaving(piece.price, percent) * count;
    byProduct[piece.productId] = (byProduct[piece.productId] ?? 0) + amount;
    total += amount;
  };

  for (const look of looks) {
    if (look.productIds.length !== LOOK_SIZE) continue;
    const pieces = look.productIds.flatMap((id) => {
      const piece = lines.find((l) => l.productId === id);
      return piece && piece.quantity > 0 ? [piece] : [];
    });
    if (pieces.length < 2) continue;

    const sets = pieces.length === LOOK_SIZE ? Math.min(...pieces.map((p) => p.quantity)) : 0;
    for (const piece of pieces) if (sets > 0) discount(piece, look.discountPercent, sets);

    // What's left after the complete sets: at most two pieces still have units.
    const left = pieces.filter((p) => p.quantity > sets);
    if (left.length === 2) {
      const pairs = Math.min(left[0].quantity - sets, left[1].quantity - sets);
      const percent = Math.min(PAIR_DISCOUNT_PERCENT, look.discountPercent);
      for (const piece of left) discount(piece, percent, pairs);
    }

    if (sets > 0 || left.length === 2) lookIds.push(look.id);
  }
  return { total, byProduct, lookIds };
}

type SummaryLook = {
  id: string;
  discountPercent: number;
  available: boolean;
  pieces: { productId: string; price: number; available: boolean }[];
};

// For the cart page: the estimated set saving (checkout recomputes it from the
// database) and the looks one step from complete, with the pieces to add.
export function cartLookSummary<L extends SummaryLook>(items: CartLine[], looks: L[]) {
  const saving = bundleDiscounts(
    items,
    looks.map((look) => ({
      id: look.id,
      discountPercent: look.discountPercent,
      productIds: look.pieces.map((p) => p.productId),
    }))
  ).total;

  const inCart = new Set(items.map((i) => i.productId));
  const upsells = looks
    .filter((look) => look.available)
    .map((look) => ({ look, missing: look.pieces.filter((p) => !inCart.has(p.productId)) }))
    .filter(({ look, missing }) => missing.length > 0 && missing.length < look.pieces.length) as {
    look: L;
    missing: L["pieces"];
  }[];

  return { saving, upsells };
}
