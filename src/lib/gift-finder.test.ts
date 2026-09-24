import { describe, expect, it } from "vitest";
import {
  buildWhyItMatches,
  deriveProductType,
  isProductAvailable,
  priceInBudget,
  scoreGiftCandidates,
  type GiftCandidateProduct,
  type GiftFinderAnswers,
} from "./gift-finder";

function product(overrides: Partial<GiftCandidateProduct> = {}): GiftCandidateProduct {
  return {
    id: "p1",
    slug: "collana-fiore",
    name: "Collana Fiore",
    price: 8900,
    currency: "EUR",
    imageUrl: null,
    active: true,
    trackInventory: true,
    stockQty: 5,
    giftStyles: [],
    giftOccasions: [],
    giftRecipients: [],
    productType: "necklace",
    lookId: null,
    lookComplete: false,
    ...overrides,
  };
}

const baseAnswers: GiftFinderAnswers = {
  recipient: "partner",
  occasion: "birthday",
  style: "elegant",
  budget: "50to100",
  preference: "necklace",
};

describe("priceInBudget", () => {
  it("classifies each band by its boundary in cents", () => {
    expect(priceInBudget(4999, "under50")).toBe(true);
    expect(priceInBudget(5000, "under50")).toBe(false);
    expect(priceInBudget(5000, "50to100")).toBe(true);
    expect(priceInBudget(9999, "50to100")).toBe(true);
    expect(priceInBudget(10000, "50to100")).toBe(false);
    expect(priceInBudget(10000, "100to150")).toBe(true);
    expect(priceInBudget(14999, "100to150")).toBe(true);
    expect(priceInBudget(15000, "100to150")).toBe(false);
    expect(priceInBudget(15000, "over150")).toBe(true);
    expect(priceInBudget(999999, "over150")).toBe(true);
  });
});

describe("isProductAvailable", () => {
  it("excludes inactive products", () => {
    expect(isProductAvailable(product({ active: false }))).toBe(false);
  });

  it("excludes tracked products with no stock", () => {
    expect(isProductAvailable(product({ trackInventory: true, stockQty: 0 }))).toBe(false);
  });

  it("keeps untracked products regardless of stockQty", () => {
    expect(isProductAvailable(product({ trackInventory: false, stockQty: 0 }))).toBe(true);
  });

  it("keeps active, in-stock products", () => {
    expect(isProductAvailable(product({ trackInventory: true, stockQty: 3 }))).toBe(true);
  });
});

describe("scoreGiftCandidates weights", () => {
  it("gives full marks (100) when every criterion matches", () => {
    const p = product({
      giftStyles: ["elegant"],
      giftOccasions: ["birthday"],
      price: 8900, // within 50to100
      productType: "necklace",
    });
    const [result] = scoreGiftCandidates([p], baseAnswers);
    expect(result.score).toBe(100);
    expect(result.matched.sort()).toEqual(["budget", "occasion", "style", "type"].sort());
  });

  it("weighs style at 40%", () => {
    const matching = product({ id: "a", giftStyles: ["elegant"] });
    const notMatching = product({ id: "b", giftStyles: ["bold"] });
    const [a] = scoreGiftCandidates([matching], baseAnswers);
    const [b] = scoreGiftCandidates([notMatching], baseAnswers);
    expect(a.score - b.score).toBe(40);
  });

  it("weighs occasion at 20%", () => {
    const matching = product({ id: "a", giftOccasions: ["birthday"] });
    const notMatching = product({ id: "b", giftOccasions: ["christmas"] });
    const [a] = scoreGiftCandidates([matching], baseAnswers);
    const [b] = scoreGiftCandidates([notMatching], baseAnswers);
    expect(a.score - b.score).toBe(20);
  });

  it("weighs budget at 20%", () => {
    const inBudget = product({ id: "a", price: 8900 });
    const outOfBudget = product({ id: "b", price: 200000 });
    const [a] = scoreGiftCandidates([inBudget], baseAnswers);
    const [b] = scoreGiftCandidates([outOfBudget], baseAnswers);
    expect(a.score - b.score).toBe(20);
  });

  it("weighs product-type preference at 20%", () => {
    const matching = product({ id: "a", productType: "necklace" });
    const notMatching = product({ id: "b", productType: "bracelet" });
    const [a] = scoreGiftCandidates([matching], baseAnswers);
    const [b] = scoreGiftCandidates([notMatching], baseAnswers);
    expect(a.score - b.score).toBe(20);
  });

  it("scores untagged products 0 on style/occasion", () => {
    const p = product({ giftStyles: [], giftOccasions: [] });
    const [result] = scoreGiftCandidates([p], baseAnswers);
    expect(result.matched).not.toContain("style");
    expect(result.matched).not.toContain("occasion");
  });
});

describe("scoreGiftCandidates preference = notSure", () => {
  it("gives full type score to any product type", () => {
    const necklace = product({ id: "a", productType: "necklace" });
    const bracelet = product({ id: "b", productType: "bracelet" });
    const earrings = product({ id: "c", productType: "earrings" });
    const answers = { ...baseAnswers, preference: "notSure" as const };
    const results = scoreGiftCandidates([necklace, bracelet, earrings], answers);
    for (const r of results) {
      expect(r.matched).toContain("type");
    }
  });
});

describe("scoreGiftCandidates preference = completeSet", () => {
  it("favors products whose look is complete regardless of piece type", () => {
    const complete = product({ id: "a", productType: "earrings", lookComplete: true });
    const incomplete = product({ id: "b", productType: "necklace", lookComplete: false });
    const answers = { ...baseAnswers, preference: "completeSet" as const };
    const results = scoreGiftCandidates([complete, incomplete], answers);
    const a = results.find((r) => r.product.id === "a")!;
    const b = results.find((r) => r.product.id === "b")!;
    expect(a.matched).toContain("type");
    expect(b.matched).not.toContain("type");
    expect(a.score - b.score).toBe(20);
  });
});

describe("scoreGiftCandidates exclusion", () => {
  it("never returns inactive or out-of-stock products", () => {
    const results = scoreGiftCandidates(
      [
        product({ id: "inactive", active: false }),
        product({ id: "oos", trackInventory: true, stockQty: 0 }),
        product({ id: "ok" }),
      ],
      baseAnswers
    );
    expect(results.map((r) => r.product.id)).toEqual(["ok"]);
  });
});

describe("scoreGiftCandidates result size", () => {
  it("returns at most 3 results, highest score first", () => {
    const candidates = Array.from({ length: 10 }, (_, i) =>
      product({
        id: `p${i}`,
        giftStyles: i < 5 ? ["elegant"] : [],
        price: 8900,
      })
    );
    const results = scoreGiftCandidates(candidates, baseAnswers);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.score >= results[results.length - 1].score)).toBe(true);
  });

  it("falls back to budget/type scoring alone when nothing is tagged", () => {
    const candidates = [
      product({ id: "a", price: 8900, productType: "necklace" }),
      product({ id: "b", price: 200000, productType: "bracelet" }),
    ];
    const results = scoreGiftCandidates(candidates, baseAnswers);
    expect(results).toHaveLength(2);
    expect(results[0].product.id).toBe("a");
    expect(results[0].score).toBe(40); // budget + type, no style/occasion tags
  });

  it("returns an empty array when there are no available candidates", () => {
    expect(scoreGiftCandidates([], baseAnswers)).toEqual([]);
  });
});

describe("deriveProductType", () => {
  it("maps known Italian and English category names/slugs", () => {
    expect(deriveProductType({ name: "Collane", nameEn: null, slug: "collane-in-vetro-di-murano" })).toBe(
      "necklace"
    );
    expect(deriveProductType({ name: "Bracciali", nameEn: "Bracelets", slug: "bracelets" })).toBe(
      "bracelet"
    );
    expect(deriveProductType({ name: "Orecchini", nameEn: null, slug: "orecchini" })).toBe("earrings");
  });

  it("returns null for an unrecognized or missing category", () => {
    expect(deriveProductType(null)).toBeNull();
    expect(deriveProductType({ name: "Home decor", nameEn: null, slug: "home-decor" })).toBeNull();
  });
});

describe("buildWhyItMatches", () => {
  const reasons = { style: "Style", occasion: "Occasion", budget: "Budget", type: "Type" };

  it("returns the fallback when nothing matched", () => {
    expect(buildWhyItMatches([], reasons, "Fallback")).toBe("Fallback");
  });

  it("joins matched criteria in weight order, capped at 2", () => {
    expect(buildWhyItMatches(["budget", "style", "occasion"], reasons, "Fallback")).toBe(
      "Style · Occasion"
    );
  });

  it("prioritizes type over budget when both matched", () => {
    expect(buildWhyItMatches(["budget", "type"], reasons, "Fallback")).toBe("Type · Budget");
  });
});
