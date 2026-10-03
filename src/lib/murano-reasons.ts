// The "why Murano" section on the home page: three reasons, each beside a piece.
// Staff choose the piece for each row in Admin > Settings; a row left on
// "Automatic" is filled from the homepage's own popular pieces, so the section is
// never short.

export const MURANO_REASON_COUNT = 3;

/**
 * The stored choice for each row, looked up among `products`: slot `i` is the
 * product whose id is `ids[i]`, or `undefined` for an empty slot ("" = Automatic)
 * or a piece that is gone (unpublished, hidden, deleted).
 */
export function chosenBySlot<T extends { id: string }>(
  products: T[],
  ids: string[],
  count: number = MURANO_REASON_COUNT
): (T | undefined)[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return Array.from({ length: count }, (_, slot) => {
    const id = ids[slot];
    return id ? byId.get(id) : undefined;
  });
}

/**
 * The pieces for the rows, one per slot: the staff's choice where there is one,
 * otherwise the next piece from the fallback that is not already on show. A piece
 * chosen for one row is never offered again as another row's automatic one.
 */
export function pickReasonProducts<T extends { id: string }>(
  chosen: (T | undefined)[],
  fallback: T[],
  count: number = MURANO_REASON_COUNT
): T[] {
  const taken = new Set<string>();
  for (const product of chosen.slice(0, count)) if (product) taken.add(product.id);
  const pool = fallback.filter((product) => !taken.has(product.id));

  const picked: T[] = [];
  for (let slot = 0; slot < count; slot++) {
    const product = chosen[slot] ?? pool.shift();
    if (product) picked.push(product);
  }
  return picked;
}
