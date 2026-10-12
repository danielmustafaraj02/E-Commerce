import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/store-settings", () => ({ getStoreSettings: async () => ({ defaultLocale: "it", storeName: "S", homeCopy: null }) }));
vi.mock("@/lib/i18n/locale", () => ({ getLocale: async () => "it" }));
vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: vi.fn(async () => [{ slug: "bangle-cremisi", price: 8000, currency: "EUR" }]),
    },
  },
}));

import { storyPriceSlugs, withStoryPrices } from "./builder-i18n-server";
import { parseBuilder } from "./section-builder";

const doc = parseBuilder({
  columns: 1,
  cells: [[
    { type: "story", title: "A", text: "", side: "right", src: "/a.jpg", alt: "", href: "/products/bangle-cremisi", cardTitle: "Bangle" },
    { type: "story", title: "B", text: "", side: "left", src: "/b.jpg", alt: "", href: "/products/other", cardTitle: "Other", cardPrice: "€ 5" },
    { type: "story", title: "C", text: "", side: "left", src: "/c.jpg", alt: "", href: "/about", cardTitle: "Not a product" },
  ]],
})!;

describe("story card prices", () => {
  it("are read from the linked product unless typed in", async () => {
    expect(storyPriceSlugs(doc)).toEqual(["bangle-cremisi"]);
    const filled = await withStoryPrices(doc);
    const cards = filled.cells[0].map((b) => (b.type === "story" ? b.cardPrice : null));
    expect(cards[0]).toMatch(/80,00/);
    expect(cards[1]).toBe("€ 5");
    expect(cards[2]).toBeUndefined();
  });
});
