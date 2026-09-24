import { describe, expect, it } from "vitest";
import { pickSpecialSelection } from "./homepage-data";

type Candidate = { id: string; price: number; compareAtPrice: number | null };

describe("pickSpecialSelection", () => {
  it("excludes products with no compareAtPrice", () => {
    const products: Candidate[] = [{ id: "a", price: 1000, compareAtPrice: null }];
    expect(pickSpecialSelection(products)).toEqual([]);
  });

  it("excludes products where compareAtPrice isn't actually higher than price", () => {
    const products: Candidate[] = [
      { id: "a", price: 1000, compareAtPrice: 1000 },
      { id: "b", price: 1000, compareAtPrice: 900 },
    ];
    expect(pickSpecialSelection(products)).toEqual([]);
  });

  it("orders the deepest real discount first", () => {
    const products: Candidate[] = [
      { id: "small-discount", price: 900, compareAtPrice: 1000 }, // 10% off
      { id: "big-discount", price: 6900, compareAtPrice: 8900 }, // ~22% off
    ];
    expect(pickSpecialSelection(products).map((p) => p.id)).toEqual([
      "big-discount",
      "small-discount",
    ]);
  });

  it("caps the result at the given size", () => {
    const products: Candidate[] = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`,
      price: 1000,
      compareAtPrice: 2000,
    }));
    expect(pickSpecialSelection(products, 4)).toHaveLength(4);
  });
});
