import { describe, expect, it } from "vitest";
import { bundleDiscounts, cartLookSummary, lookPricing, LOOK_SIZE } from "./looks";

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

  it("gives nothing when a piece is missing", () => {
    const result = bundleDiscounts([line("n", 12000), line("b", 4500)], [look]);
    expect(result).toEqual({ total: 0, byProduct: {}, lookIds: [] });
  });

  it("counts only complete sets when quantities differ", () => {
    const result = bundleDiscounts(
      [line("n", 12000, 2), line("b", 4500, 2), line("e", 1500, 1)],
      [look]
    );
    // One complete set: the second necklace and bracelet are full price.
    expect(result.total).toBe(2700);
  });

  it("discounts two complete sets", () => {
    const result = bundleDiscounts(
      [line("n", 12000, 2), line("b", 4500, 2), line("e", 1500, 2)],
      [look]
    );
    expect(result.total).toBe(5400);
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
