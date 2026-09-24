import { describe, expect, it } from "vitest";
import {
  bundleDiscounts,
  cartLookSummary,
  lookPricing,
  COMPOSED_LOOK_DISCOUNT_PERCENT,
  LOOK_SIZE,
  PAIR_DISCOUNT_PERCENT,
} from "./looks";

describe("lookPricing", () => {
  it("prices the complete set from the pieces' real prices", () => {
    const pricing = lookPricing([12000, 4500, 1500], 15);
    expect(pricing).toEqual({ individualTotal: 18000, setTotal: 15300, saving: 2700 });
  });

  it("rounds the saving per piece, the same way checkout does", () => {
    // 15% of 3333 = 499.95 -> 500 per piece.
    expect(lookPricing([3333, 3333, 3333], 15).saving).toBe(1500);
  });
});

describe("bundleDiscounts", () => {
  const look = { id: "look1", discountPercent: 15, productIds: ["n", "b", "e"] };
  const line = (productId: string, price: number, quantity = 1) => ({
    productId,
    price,
    quantity,
  });

  it("discounts every piece of a look when the whole look is in the cart", () => {
    const result = bundleDiscounts(
      [line("n", 12000), line("b", 4500), line("e", 1500), line("other", 9900)],
      [look]
    );
    expect(result.total).toBe(2700);
    expect(result.byProduct).toEqual({ n: 1800, b: 675, e: 225 });
    expect(result.lookIds).toEqual(["look1"]);
  });

  it("takes 10% off two pieces of the same look bought together", () => {
    expect(PAIR_DISCOUNT_PERCENT).toBe(10);
    const result = bundleDiscounts([line("n", 12000), line("b", 4500)], [look]);
    expect(result).toEqual({
      total: 1650,
      byProduct: { n: 1200, b: 450 },
      lookIds: ["look1"],
      composedLooks: 0,
    });
  });

  it("gives nothing for a single piece", () => {
    expect(bundleDiscounts([line("n", 12000)], [look])).toEqual({
      total: 0,
      byProduct: {},
      lookIds: [],
      composedLooks: 0,
    });
  });

  it("counts only complete sets when quantities differ", () => {
    const result = bundleDiscounts(
      [line("n", 12000, 2), line("b", 4500, 2), line("e", 1500, 1)],
      [look]
    );
    // One complete set at 15%, then the extra necklace + bracelet as a pair at 10%.
    expect(result.total).toBe(2700 + 1200 + 450);
  });

  it("discounts two complete sets", () => {
    const result = bundleDiscounts(
      [line("n", 12000, 2), line("b", 4500, 2), line("e", 1500, 2)],
      [look]
    );
    expect(result.total).toBe(5400);
  });

  it("never gives a pair more than the look's own set discount", () => {
    const small = { id: "look3", discountPercent: 5, productIds: ["n", "b", "e"] };
    expect(bundleDiscounts([line("n", 10000), line("b", 10000)], [small]).total).toBe(1000);
  });

  it("ignores looks that don't have exactly the full number of pieces", () => {
    const partial = { id: "look2", discountPercent: 15, productIds: ["n", "b"] };
    expect(LOOK_SIZE).toBe(3);
    expect(bundleDiscounts([line("n", 12000), line("b", 4500)], [partial]).total).toBe(0);
  });
});

describe("cartLookSummary", () => {
  const piece = (productId: string, price: number, available = true) => ({
    productId,
    price,
    available,
  });
  const look = {
    id: "look1",
    discountPercent: 15,
    available: true,
    pieces: [piece("n", 12000), piece("b", 4500), piece("e", 1500)],
  };
  const item = (productId: string, price: number, quantity = 1) => ({ productId, price, quantity });

  it("estimates the saving for complete looks in the cart", () => {
    const summary = cartLookSummary([item("n", 12000), item("b", 4500), item("e", 1500)], [look]);
    expect(summary.saving).toBe(2700);
    expect(summary.upsells).toEqual([]);
  });

  it("offers the missing pieces of a look that's partly in the cart", () => {
    const summary = cartLookSummary([item("n", 12000)], [look]);
    expect(summary.saving).toBe(0);
    expect(summary.upsells).toEqual([{ look, missing: [look.pieces[1], look.pieces[2]] }]);
  });

  it("doesn't offer a look whose missing piece is out of stock", () => {
    const soldOut = {
      ...look,
      available: false,
      pieces: [piece("n", 12000), piece("b", 4500, false), piece("e", 1500)],
    };
    expect(cartLookSummary([item("n", 12000)], [soldOut]).upsells).toEqual([]);
  });
});

describe("bundleDiscounts: composed looks", () => {
  const line = (productId: string, price: number, quantity = 1) => ({
    productId,
    price,
    quantity,
  });
  const kinds = {
    n1: "necklace",
    n2: "necklace",
    b1: "bracelet",
    e1: "earrings",
    e2: "earrings",
  } as const;

  it("takes 10% off any necklace, bracelet and earrings bought together", () => {
    expect(COMPOSED_LOOK_DISCOUNT_PERCENT).toBe(10);
    const result = bundleDiscounts(
      [line("n1", 12000), line("b1", 8000), line("e1", 6000)],
      [],
      kinds
    );
    expect(result.composedLooks).toBe(1);
    expect(result.byProduct).toEqual({ n1: 1200, b1: 800, e1: 600 });
    expect(result.total).toBe(2600);
  });

  it("needs all three kinds, and the product kinds to know them", () => {
    expect(bundleDiscounts([line("n1", 12000), line("e1", 6000)], [], kinds).total).toBe(0);
    expect(
      bundleDiscounts([line("n1", 12000), line("b1", 8000), line("e1", 6000)], []).total
    ).toBe(0);
  });

  it("uses the dearest pieces of each kind when there are spares", () => {
    const result = bundleDiscounts(
      [line("n1", 12000), line("n2", 20000), line("b1", 8000), line("e1", 6000), line("e2", 9000)],
      [],
      kinds
    );
    expect(result.composedLooks).toBe(1);
    expect(result.byProduct).toEqual({ n2: 2000, b1: 800, e2: 900 });
  });

  it("never discounts a piece twice: staff sets first, then composed looks", () => {
    const look = { id: "set", discountPercent: 15, productIds: ["n1", "b1", "e1"] };
    const result = bundleDiscounts(
      [line("n1", 12000, 2), line("b1", 8000, 1), line("e1", 6000, 2)],
      [look],
      kinds
    );
    // One set at 15%; the spare necklace and earrings have no bracelet left,
    // so they form a pair of the same look at 10% instead.
    expect(result.composedLooks).toBe(0);
    expect(result.total).toBe(1800 + 1200 + 900 + 1200 + 600);
  });

  it("prefers a composed look of three over a pair of two", () => {
    const look = { id: "set", discountPercent: 15, productIds: ["n1", "b1", "x"] };
    const result = bundleDiscounts(
      [line("n1", 12000), line("b1", 8000), line("e1", 6000)],
      [look],
      kinds
    );
    expect(result.composedLooks).toBe(1);
    expect(result.lookIds).toEqual([]);
    expect(result.total).toBe(2600);
  });
});
