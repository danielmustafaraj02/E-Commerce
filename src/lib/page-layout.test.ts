import { describe, expect, it } from "vitest";
import {
  HOME_SECTIONS,
  PRODUCT_SECTIONS,
  parseProductPageLayout,
  resolveLayout,
  visibleOrder,
} from "./page-layout";

describe("resolveLayout", () => {
  it("null gives the default order, all visible", () => {
    const r = resolveLayout(null, HOME_SECTIONS);
    expect(r.map((e) => e.id)).toEqual(HOME_SECTIONS.map((s) => s.id));
    expect(r.every((e) => e.visible)).toBe(true);
  });

  it("keeps stored order, drops unknown/duplicate ids, appends missing ones", () => {
    const r = resolveLayout(
      [
        { id: "faq", visible: false },
        { id: "nope", visible: true },
        { id: "faq", visible: true },
        { id: "popular", visible: true },
      ],
      HOME_SECTIONS
    );
    expect(r.slice(0, 2)).toEqual([
      { id: "faq", visible: false },
      { id: "popular", visible: true },
    ]);
    expect(r).toHaveLength(HOME_SECTIONS.length);
  });

  it("survives garbage", () => {
    expect(resolveLayout("x", PRODUCT_SECTIONS)).toHaveLength(PRODUCT_SECTIONS.length);
    expect(resolveLayout([null, 3], PRODUCT_SECTIONS)).toHaveLength(PRODUCT_SECTIONS.length);
  });
});

describe("visibleOrder", () => {
  it("skips hidden sections and per-product hidden ids", () => {
    const stored = [{ id: "gift", visible: false }];
    const order = visibleOrder(stored, PRODUCT_SECTIONS, ["related"]);
    expect(order).not.toContain("gift");
    expect(order).not.toContain("related");
    expect(order).toContain("reviews");
  });
});

describe("parseProductPageLayout", () => {
  it("returns empty for null", () => {
    expect(parseProductPageLayout(null)).toEqual({ hidden: [], blocks: [] });
  });
  it("filters unknown hidden ids, trims blocks, drops empty ones", () => {
    const r = parseProductPageLayout({
      hidden: ["gift", "bogus", 5],
      blocks: [{ title: " Care ", body: " Wipe " }, { title: "", body: "" }, "x"],
    });
    expect(r.hidden).toEqual(["gift"]);
    expect(r.blocks).toEqual([{ title: "Care", body: "Wipe" }]);
  });
});
