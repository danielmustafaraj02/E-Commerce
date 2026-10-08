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

  it("keeps stored order, drops unknown/duplicate ids, adds missing ones", () => {
    const r = resolveLayout(
      [
        { id: "faq", visible: false },
        { id: "nope", visible: true },
        { id: "faq", visible: true },
        { id: "popular", visible: true },
      ],
      HOME_SECTIONS
    );
    const ids = r.map((e) => e.id);
    expect(r.find((e) => e.id === "faq")).toEqual({ id: "faq", visible: false });
    expect(ids.indexOf("faq")).toBeLessThan(ids.indexOf("popular"));
    expect(ids).not.toContain("nope");
    expect(r).toHaveLength(HOME_SECTIONS.length);
  });

  it("puts a section the stored list lacks where it sits in the default order", () => {
    // A layout saved before the hero and showcase became sections.
    const saved = HOME_SECTIONS.filter((s) => s.id !== "hero" && s.id !== "showcase")
      .reverse()
      .map((s) => ({ id: s.id, visible: true }));
    const ids = resolveLayout(saved, HOME_SECTIONS).map((e) => e.id);
    expect(ids.slice(0, 2)).toEqual(["hero", "showcase"]);
    expect(ids).toHaveLength(HOME_SECTIONS.length);
    // Later sections keep the admin's (reversed) order.
    expect(ids.slice(2)).toEqual(saved.map((e) => e.id));
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

describe("pages that can be arranged", () => {
  it("defines sections, a label and a preview path for every page", async () => {
    const { PAGE_TARGETS, PAGE_LABELS, PREVIEW_PATHS, SECTIONS_BY_TARGET, isPageTarget } =
      await import("./page-layout");
    for (const target of PAGE_TARGETS) {
      expect(SECTIONS_BY_TARGET[target].length, target).toBeGreaterThan(0);
      expect(PAGE_LABELS[target], target).toBeTruthy();
      expect(PREVIEW_PATHS[target], target).toBeDefined();
      const ids = SECTIONS_BY_TARGET[target].map((s) => s.id);
      expect(new Set(ids).size, target).toBe(ids.length);
      expect(isPageTarget(target)).toBe(true);
    }
    expect(isPageTarget("checkout")).toBe(false);
    expect(isPageTarget("../etc")).toBe(false);
  });

  it("keeps your own section where you put it and restores a missing built-in at its default place", async () => {
    const { SECTIONS_BY_TARGET, resolveLayout } = await import("./page-layout");
    const layout = resolveLayout(
      [
        { id: "head", visible: true },
        {
          id: "custom-abc123",
          visible: true,
          custom: { name: "Promo", html: "<p>Hi</p>", css: "" },
        },
      ],
      SECTIONS_BY_TARGET.contact
    );
    expect(layout.map((e) => e.id)).toEqual(["head", "form", "custom-abc123"]);
    // A stored layout that predates a section still gets it, in default order.
    expect(resolveLayout(null, SECTIONS_BY_TARGET.about).map((e) => e.id)).toEqual([
      "hero",
      "body",
      "art",
    ]);
  });
});

describe("section options and fixed sections", () => {
  it("keeps only known, non-default option values", async () => {
    const { PRODUCT_SECTIONS, resolveLayout } = await import("./page-layout");
    const top = resolveLayout(
      [
        {
          id: "top",
          visible: true,
          options: {
            gallery: "right",
            titleSize: "huge",
            backLink: "off",
            thumbs: "on",
            unknown: "off",
            buyNow: "off",
          },
        },
      ],
      PRODUCT_SECTIONS
    ).find((e) => e.id === "top")!;
    expect(top.options).toEqual({ gallery: "right", backLink: "off", buyNow: "off" });
  });

  it("never hides or replaces the photos and buy box", async () => {
    const { PRODUCT_SECTIONS, resolveLayout } = await import("./page-layout");
    const top = resolveLayout(
      [{ id: "top", visible: false, html: "<p>gone</p>", builder: { columns: 1, cells: [[]] } }],
      PRODUCT_SECTIONS
    ).find((e) => e.id === "top")!;
    expect(top.visible).toBe(true);
    expect(top.html).toBeUndefined();
    expect(top.builder).toBeUndefined();
  });

  it("restores it as the first section when a saved layout predates it", async () => {
    const { PRODUCT_SECTIONS, resolveLayout } = await import("./page-layout");
    const ids = resolveLayout([{ id: "reviews", visible: true }], PRODUCT_SECTIONS).map(
      (e) => e.id
    );
    expect(ids[0]).toBe("top");
  });

  it("cannot be hidden for a single product either", async () => {
    const { parseProductPageLayout } = await import("./page-layout");
    expect(parseProductPageLayout({ hidden: ["top", "gift"], blocks: [] }).hidden).toEqual([
      "gift",
    ]);
  });

  it("turns options into data attributes", async () => {
    const { optionAttributes } = await import("./section-style");
    expect(optionAttributes({ backLink: "off", gallery: "right" })).toEqual({
      "data-opt-back-link": "off",
      "data-opt-gallery": "right",
    });
    expect(optionAttributes(undefined)).toEqual({});
  });
});
describe("withEditorialExamples", () => {
  // A stand-in for page-templates' `templateBody`, so this stays a pure test.
  const make = () => ({
    builder: { columns: 1 as const, gap: 1, divider: "none" as const, valign: "top" as const, cells: [[]] },
  });

  it("seeds the five examples into the built-in home order", async () => {
    const { withEditorialExamples, isEditorialSeed } = await import("./page-layout");
    const layout = resolveLayout(null, HOME_SECTIONS);
    const seeded = withEditorialExamples(layout, make);
    const added = seeded.filter((e) => isEditorialSeed(e.id));
    expect(added).toHaveLength(5);
    // Each one sits directly after the section it belongs to.
    const after = seeded.map((e) => e.id);
    expect(after[after.indexOf("showcase") + 1]).toBe("custom-manifesto");
    expect(after[after.indexOf("special") + 1]).toBe("custom-feature");
  });

  it("does not re-add an example the admin deleted (hidden tombstone)", async () => {
    const { withEditorialExamples, isEditorialSeed } = await import("./page-layout");
    const layout = resolveLayout(
      [{ id: "custom-manifesto", visible: false, custom: { name: "x", html: "", css: "" } }],
      HOME_SECTIONS
    );
    const seeded = withEditorialExamples(layout, make);
    // The other four still come back; the deleted one does not.
    expect(seeded.filter((e) => isEditorialSeed(e.id)).map((e) => e.id)).toEqual([
      "custom-spread",
      "custom-numbers",
      "custom-quote",
      "custom-feature",
    ]);
    // And the tombstone itself is kept out of what gets rendered.
    expect(seeded.find((e) => e.id === "custom-manifesto")).toBeUndefined();
  });

  it("keeps an example the admin restyled, exactly as it is", async () => {
    const { withEditorialExamples } = await import("./page-layout");
    const restyled = {
      id: "custom-manifesto",
      visible: true,
      custom: { name: "My band", html: "", css: "" },
      style: { bg: "#123456" },
    };
    const seeded = withEditorialExamples(resolveLayout([restyled], HOME_SECTIONS), make);
    expect(seeded.find((e) => e.id === "custom-manifesto")).toEqual(restyled);
  });
});

describe("look row styles", () => {
  it("offers the same choices on the home and Looks sections", async () => {
    const { HOME_SECTIONS, LOOKS_SECTIONS, LOOK_OPTIONS, LOOK_STYLE_OPTION } = await import(
      "./page-layout"
    );
    expect(HOME_SECTIONS.find((s) => s.id === "looks")?.options).toEqual(LOOK_OPTIONS);
    // The /looks page's list carries the same option set, so the CSS rules
    // (which key on data-opt-look-style, not on the page) serve both.
    expect(LOOKS_SECTIONS.find((s) => s.id === "list")?.options).toEqual(LOOK_OPTIONS);
    expect(LOOK_STYLE_OPTION.type).toBe("choice");
    if (LOOK_STYLE_OPTION.type !== "choice") throw new Error("unreachable");
    // Original treatments, existing editorial IDs, then the four bold editions.
    expect(LOOK_STYLE_OPTION.choices.map((c) => c.value)).toEqual([
      "editorial",
      "alternating",
      "stacked",
      "minimal",
      "framed",
      "xxl",
      "botanical",
      "collage",
      "atelier",
      "runway",
      "collector",
      "botanical-atelier",
      "forest-editorial",
      "botanical-cutout",
      "couture-collage",
      "modern-collage-bold",
      "runway-bold",
      "forest-bold",
      "couture-bold",
    ]);
    // "editorial" stays first, so it stays the default and nothing changes on
    // the site until the admin picks something else.
    expect(LOOK_STYLE_OPTION.choices[0].value).toBe("editorial");
    // Every value is unique, or the select would show duplicates.
    const values = LOOK_STYLE_OPTION.choices.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("keeps a chosen style and drops the default (so the shipped layout stays)", async () => {
    const { HOME_SECTIONS, LOOKS_SECTIONS, resolveLayout } = await import("./page-layout");
    const stored = [{ id: "looks", visible: true, options: { lookStyle: "minimal" } }];
    expect(resolveLayout(stored, HOME_SECTIONS).find((e) => e.id === "looks")?.options).toEqual({
      lookStyle: "minimal",
    });

    const customLookOptions = {
      lookStyle: "minimal",
      lookAccent: "sage",
      lookDensity: "airy",
      lookTextAlign: "center",
      lookCta: "subtle",
    };
    expect(
      resolveLayout(
        [{ id: "looks", visible: true, options: customLookOptions }],
        HOME_SECTIONS
      ).find((e) => e.id === "looks")?.options
    ).toEqual(customLookOptions);
    // "editorial" is the first choice = the default, so it is not stored.
    expect(
      resolveLayout(
        [{ id: "looks", visible: true, options: { lookStyle: "editorial" } }],
        HOME_SECTIONS
      ).find((e) => e.id === "looks")?.options
    ).toBeUndefined();
    // An unknown value is refused outright.
    expect(
      resolveLayout(
        [{ id: "looks", visible: true, options: { lookStyle: "nope" } }],
        HOME_SECTIONS
      ).find((e) => e.id === "looks")?.options
    ).toBeUndefined();

    // The /looks page's own section behaves identically.
    expect(
      resolveLayout(
        [{ id: "list", visible: true, options: { lookStyle: "framed" } }],
        LOOKS_SECTIONS
      ).find((e) => e.id === "list")?.options
    ).toEqual({ lookStyle: "framed" });
    expect(
      resolveLayout(
        [{ id: "list", visible: true, options: { lookStyle: "bogus" } }],
        LOOKS_SECTIONS
      ).find((e) => e.id === "list")?.options
    ).toBeUndefined();
  });

  it("reaches the section as data-opt-look-style, which the CSS keys on", async () => {
    const { optionAttributes } = await import("./section-style");
    expect(optionAttributes({ lookStyle: "stacked" })).toEqual({
      "data-opt-look-style": "stacked",
    });
  });
});
