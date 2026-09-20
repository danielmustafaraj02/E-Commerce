import { describe, expect, it } from "vitest";
import { feedTitle, googleProductCategory } from "./merchant-feed";

describe("googleProductCategory", () => {
  it.each([
    ["Bracciali", "Apparel & Accessories > Jewelry > Bracelets"],
    ["Collane", "Apparel & Accessories > Jewelry > Necklaces"],
    ["Orecchini", "Apparel & Accessories > Jewelry > Earrings"],
    ["  bracelets ", "Apparel & Accessories > Jewelry > Bracelets"],
  ])("maps %s", (name, expected) => {
    expect(googleProductCategory({ name })).toBe(expected);
  });

  it("also matches on the English name when the source name differs", () => {
    expect(googleProductCategory({ name: "Gioielli", nameEn: "Earrings" })).toBe(
      "Apparel & Accessories > Jewelry > Earrings"
    );
  });

  it("returns nothing for an unknown category rather than guessing", () => {
    expect(googleProductCategory({ name: "Home Goods" })).toBeNull();
    expect(googleProductCategory(null)).toBeNull();
  });
});

describe("feedTitle", () => {
  it("adds product-type keywords so the title is not just the bare name", () => {
    expect(feedTitle("Ruby Necklace", "en")).toBe("Ruby Necklace – Handmade Murano Glass Jewelry");
    expect(feedTitle("Collana Rubino", "it")).toBe(
      "Collana Rubino – Gioiello in vetro di Murano fatto a mano"
    );
  });

  it("stays within Google's 150-character limit", () => {
    expect(feedTitle("x".repeat(400), "en").length).toBe(150);
  });
});
