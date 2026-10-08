import { describe, expect, it } from "vitest";
import manifest from "./new-collection-manifest.json";
import { applyPricingCsv, validateCollection, pricesLikeExisting } from "./new-collection";

const header = "sku,name,kind,price_eur,stock_qty\n";

describe("new collection import", () => {
  it("copies actual common prices by product type, without averaging them", () => {
    const baseline = [
      { category: { name: "Collane" }, price: 12000 },
      { category: { name: "Collane" }, price: 12000 },
      { category: { name: "Collane" }, price: 15000 },
      { category: { name: "Bracciali" }, price: 8000 },
      { category: { name: "Orecchini" }, price: 6000 },
      { category: { name: "Orecchini" }, price: 0 },
    ];
    expect(pricesLikeExisting(baseline)).toEqual({
      necklace: 12000,
      bracelet: 8000,
      earrings: 6000,
    });
    expect(() => pricesLikeExisting([])).toThrow("No existing necklace price");
  });
  it("groups all 54 photos into 46 distinct products and eight complete looks", () => {
    const collection = validateCollection(manifest);
    expect(collection.products).toHaveLength(46);
    expect(collection.products.flatMap((p) => p.images)).toHaveLength(54);
    expect(collection.looks).toHaveLength(8);
    for (const kind of ["necklace", "bracelet", "earrings"]) {
      expect(collection.products.filter((p) => p.kind === kind)).toHaveLength(
        { necklace: 11, bracelet: 16, earrings: 19 }[kind]!
      );
    }
  });

  it("blocks publication until prices and stock are supplied", () => {
    expect(() => validateCollection(manifest, true)).toThrow("approved price and stock");
    const ready = validateCollection(manifest);
    ready.products = ready.products.map((p) => ({
      ...p,
      price: 5900,
      stockQty: 0,
    }));
    expect(validateCollection(ready, true).products.every((p) => p.stockQty === 0)).toBe(true);
  });

  it("rejects repeated source images and incomplete matching sets", () => {
    const duplicate = structuredClone(manifest);
    duplicate.products[1].images[0].source = duplicate.products[0].images[0].source;
    expect(() => validateCollection(duplicate)).toThrow("Duplicate source image");
    const invalid = structuredClone(manifest);
    invalid.looks[0].productSlugs[2] = invalid.looks[0].productSlugs[0];
    expect(() => validateCollection(invalid)).toThrow("one necklace, one bracelet");
  });

  it("converts approved worksheet prices to cents without changing the source manifest", () => {
    const collection = validateCollection(manifest);
    const sku = collection.products[0].sku;
    const priced = applyPricingCsv(collection, header + `${sku},Name,earrings,49.90,3\n`);
    expect(priced.products[0].price).toBe(4990);
    expect(priced.products[0].stockQty).toBe(3);
    expect(collection.products[0].price).toBeNull();
  });

  it.each(["0", "-1", "12.345", "NaN"])("rejects invalid price %s", (price) => {
    const collection = validateCollection(manifest);
    expect(() =>
      applyPricingCsv(collection, header + `${collection.products[0].sku},Name,earrings,${price},1`)
    ).toThrow("positive euro price");
  });

  it("rejects duplicate worksheet rows and fractional stock", () => {
    const collection = validateCollection(manifest);
    const sku = collection.products[0].sku;
    const row = `${sku},Name,earrings,50,2\n`;
    expect(() => applyPricingCsv(collection, header + row + row)).toThrow(
      "duplicate worksheet SKU"
    );
    expect(() => applyPricingCsv(collection, header + `${sku},Name,earrings,50,1.5`)).toThrow(
      "whole stock quantity"
    );
  });
});
