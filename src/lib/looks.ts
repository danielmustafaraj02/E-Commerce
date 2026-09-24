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

// A look the shopper puts together themselves: any necklace, bracelet and
// earrings bought together, from any looks or none.
export const COMPOSED_LOOK_DISCOUNT_PERCENT = 10;
export type PieceKind = "necklace" | "bracelet" | "earrings";
const PIECE_KINDS: PieceKind[] = ["necklace", "bracelet", "earrings"];

// Savings, in this order, each unit discounted at most once:
//  1. every complete set of a staff-made look, at the look's percentage;
//  2. every composed look (one necklace + one bracelet + one earrings) among
//     the units left, at COMPOSED_LOOK_DISCOUNT_PERCENT, dearest units first;
//  3. every remaining pair of two different pieces of the same staff-made
//     look, at PAIR_DISCOUNT_PERCENT.
// `kinds` says what each product is (from its category); without it step 2
// finds nothing. Extra single pieces stay full price.
export function bundleDiscounts(
  lines: CartLine[],
  looks: LookRule[],
  kinds: Record<string, PieceKind | null | undefined> = {}
) {
  const byProduct: Record<string, number> = {};
  const used: Record<string, number> = {};
  const lookIds = new Set<string>();
  let total = 0;

  const discount = (piece: CartLine, percent: number, count: number) => {
    const amount = pieceSaving(piece.price, percent) * count;
    byProduct[piece.productId] = (byProduct[piece.productId] ?? 0) + amount;
    used[piece.productId] = (used[piece.productId] ?? 0) + count;
    total += amount;
  };
  const free = (piece: CartLine) => piece.quantity - (used[piece.productId] ?? 0);

  // 1. Complete sets.
  const pairCandidates: { look: LookRule; pieces: CartLine[] }[] = [];
  for (const look of looks) {
    if (look.productIds.length !== LOOK_SIZE) continue;
    const pieces = look.productIds.flatMap((id) => {
      const piece = lines.find((l) => l.productId === id);
      return piece && piece.quantity > 0 ? [piece] : [];
    });
    if (pieces.length < 2) continue;

    const sets = pieces.length === LOOK_SIZE ? Math.min(...pieces.map((p) => p.quantity)) : 0;
    if (sets > 0) {
      for (const piece of pieces) discount(piece, look.discountPercent, sets);
      lookIds.add(look.id);
    }
    pairCandidates.push({ look, pieces });
  }

  // 2. Composed looks from whatever is left.
  const units: Record<PieceKind, CartLine[]> = { necklace: [], bracelet: [], earrings: [] };
  for (const line of lines) {
    const kind = kinds[line.productId];
    if (!kind) continue;
    for (let i = 0; i < free(line); i++) units[kind].push(line);
  }
  for (const kind of PIECE_KINDS) units[kind].sort((a, b) => b.price - a.price);
  const composedLooks = Math.min(...PIECE_KINDS.map((kind) => units[kind].length));
  for (let i = 0; i < composedLooks; i++) {
    for (const kind of PIECE_KINDS) discount(units[kind][i], COMPOSED_LOOK_DISCOUNT_PERCENT, 1);
  }

  // 3. Pairs of the same look among the units still full price.
  for (const { look, pieces } of pairCandidates) {
    const left = pieces.filter((p) => free(p) > 0);
    if (left.length !== 2) continue;
    const pairs = Math.min(free(left[0]), free(left[1]));
    const percent = Math.min(PAIR_DISCOUNT_PERCENT, look.discountPercent);
    for (const piece of left) discount(piece, percent, pairs);
    lookIds.add(look.id);
  }

  return { total, byProduct, lookIds: [...lookIds], composedLooks };
}

type SummaryLook = {
  id: string;
  discountPercent: number;
  available: boolean;
  pieces: { productId: string; price: number; available: boolean }[];
};

// For the cart page: the estimated set saving (checkout recomputes it from the
// database) and the looks one step from complete, with the pieces to add.
export function cartLookSummary<L extends SummaryLook>(
  items: CartLine[],
  looks: L[],
  kinds: Record<string, PieceKind | null | undefined> = {}
) {
  const saving = bundleDiscounts(
    items,
    looks.map((look) => ({
      id: look.id,
      discountPercent: look.discountPercent,
      productIds: look.pieces.map((p) => p.productId),
    })),
    kinds
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
