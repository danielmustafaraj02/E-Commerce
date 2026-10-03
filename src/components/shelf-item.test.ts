import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// The client-only pieces (router-aware link, next/image, the zustand cart
// button) are stubbed: this checks ShelfItem's own conditional markup.
vi.mock("@/components/localized-link", async () => {
  const { createElement: h } = await import("react");
  return {
    Link: ({ href, children }: { href: string; children: React.ReactNode }) =>
      h("a", { href }, children),
  };
});
vi.mock("@/components/catalog-image", () => ({ CatalogImage: () => null }));
vi.mock("@/components/quick-add-button", () => ({ QuickAddButton: () => null }));

import { ShelfItem } from "./shelf-item";

const base = {
  locale: "en",
  outOfStockLabel: "Out of stock",
  quickAddLabel: "Add to cart",
  addedLabel: "Added",
};

function render(props: Partial<Parameters<typeof ShelfItem>[0]> & { stockQty?: number } = {}) {
  const { stockQty = 10, ...rest } = props;
  return renderToStaticMarkup(
    createElement(ShelfItem, {
      ...base,
      product: {
        id: "p1",
        slug: "ruby-necklace",
        name: "Ruby Necklace",
        price: 10000,
        currency: "EUR",
        stockQty,
        images: [],
      },
      ...rest,
    })
  );
}

describe("ShelfItem rating and scarcity", () => {
  it("renders no meta row when it has neither a rating nor a scarcity label", () => {
    expect(render()).not.toContain("shelf-item-meta");
  });

  it("shows the stars, a screen-reader label and the review count", () => {
    const html = render({ rating: { average: 4.5, count: 3, label: "4.5/5 · 3 reviews" } });
    expect(html).toContain("shelf-item-rating");
    expect(html).toContain("4.5/5 · 3 reviews");
    expect(html).toContain("(3)");
  });

  it("shows the scarcity line for a piece that is in stock", () => {
    const html = render({ scarcityLabel: "Only 2 left", stockQty: 2 });
    expect(html).toContain("shelf-item-scarcity");
    expect(html).toContain("Only 2 left");
  });

  it("never shows scarcity on a sold-out piece, but keeps its rating", () => {
    const html = render({
      scarcityLabel: "Only 0 left",
      stockQty: 0,
      rating: { average: 5, count: 1, label: "5.0/5 · 1 review" },
    });
    expect(html).not.toContain("shelf-item-scarcity");
    expect(html).toContain("shelf-item-rating");
  });
});
