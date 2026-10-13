import { describe, expect, it } from "vitest";
import { activeFilterChips, clearFiltersHref, listingHref } from "./shop-filters";

const labels = {
  category: (slug: string) => slug.toUpperCase(),
  color: (key: string) => `colour ${key}`,
  price: "60 – 100",
  inStock: "In stock",
};

describe("listingHref", () => {
  it("is the bare path without filters", () => {
    expect(listingHref("/products", {})).toBe("/products");
  });
  it("keeps every filter, the sort and the page", () => {
    expect(
      listingHref("/products", { category: ["a", "b"], color: ["red"], minPrice: 60, sort: "price-asc" }, 2)
    ).toBe("/products?category=a&category=b&minPrice=60&color=red&sort=price-asc&page=2");
  });
});

describe("activeFilterChips", () => {
  it("has no chips for the search, the sale view or the sort", () => {
    expect(activeFilterChips("/products", { q: "blue", sale: "1", sort: "price-desc" }, labels)).toEqual([]);
  });
  it("removes only its own value and keeps the rest", () => {
    const chips = activeFilterChips(
      "/category/collane",
      { color: ["red", "blue"], minPrice: 60, maxPrice: 100, inStock: "1", sort: "price-asc" },
      labels
    );
    expect(chips.map((chip) => [chip.label, chip.href])).toEqual([
      ["colour red", "/category/collane?minPrice=60&maxPrice=100&inStock=1&color=blue&sort=price-asc"],
      ["colour blue", "/category/collane?minPrice=60&maxPrice=100&inStock=1&color=red&sort=price-asc"],
      ["60 – 100", "/category/collane?inStock=1&color=red&color=blue&sort=price-asc"],
      ["In stock", "/category/collane?minPrice=60&maxPrice=100&color=red&color=blue&sort=price-asc"],
    ]);
  });
  it("labels categories by name", () => {
    expect(activeFilterChips("/products", { category: ["collane"] }, labels)[0]).toMatchObject({
      label: "COLLANE",
      href: "/products",
    });
  });
});

describe("clearFiltersHref", () => {
  it("keeps the search, the sale view and the sort", () => {
    expect(
      clearFiltersHref("/products", { q: "blue", sale: "1", sort: "price-asc", color: ["red"], inStock: "1" })
    ).toBe("/products?q=blue&sale=1&sort=price-asc");
  });
});
