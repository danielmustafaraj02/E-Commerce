import { describe, expect, it } from "vitest";
import {
  parseSceneOverride,
  parseShowcaseScroll,
  showcaseRoot,
  SHOWCASE_STYLES,
} from "./showcase-options";
import { parseBuilder } from "./section-builder";

describe("showcase options", () => {
  it.each(SHOWCASE_STYLES.map((style) => style.value))(
    "keeps the %s composition through save and rendering",
    (style) => {
      const doc = parseBuilder({
        columns: 1,
        gap: 0,
        divider: "none",
        valign: "top",
        cells: [
          [
            {
              type: "showcase",
              scroll: { style },
              scenes: { necklace: { name: "My collection", image: "/products/new.jpg" } },
            },
          ],
        ],
      });
      const block = doc?.cells[0][0];
      expect(block?.type).toBe("showcase");
      if (block?.type !== "showcase") throw new Error("Missing showcase block");
      expect(block.scenes?.necklace?.name).toBe("My collection");
      expect(block.scenes?.necklace?.image).toBe("/products/new.jpg");
      expect(showcaseRoot(block.scroll).attrs["data-showcase-style"]).toBe(
        style === "editorial" ? undefined : style
      );
    }
  );

  it("drops unrecognized compositions", () => {
    expect(parseShowcaseScroll({ style: "unknown" })).toBeUndefined();
  });
  it("keeps only valid scene overrides", () => {
    expect(
      parseSceneOverride({
        name: " Necklaces ",
        href: "javascript:alert(1)",
        image: "/uploads/a.jpg",
        side: "up",
        description: "x".repeat(400),
      })
    ).toEqual({ name: "Necklaces", image: "/uploads/a.jpg", description: "x".repeat(300) });
    expect(parseSceneOverride({ href: "/category/necklaces", side: "right" })).toEqual({
      href: "/category/necklaces",
      side: "right",
    });
    expect(parseSceneOverride({})).toBeUndefined();
    expect(parseSceneOverride("x")).toBeUndefined();
  });

  it("parses scroll settings, clamping and dropping defaults", () => {
    expect(
      parseShowcaseScroll({ distance: 9, transition: "zoom", rail: false, counter: true })
    ).toEqual({
      distance: 1.5,
      transition: "zoom",
      rail: false,
    });
    expect(parseShowcaseScroll({ distance: 0.5, transition: "slide" })).toBeUndefined();
    expect(parseShowcaseScroll({ bg: "red;}body{x", title: "#112233" })).toEqual({
      title: "#112233",
    });
  });

  it("describes the root element", () => {
    const root = showcaseRoot({ rail: false, cta: false, accent: "#ff0000", distance: 1 });
    expect(root.attrs).toEqual({ "data-no-rail": "", "data-no-cta": "", "data-colors": "" });
    expect(root.vars).toEqual({ "--sc-accent": "#ff0000" });
    expect(root.unit).toBe(1);
    expect(root.transition).toBe("slide");
    expect(showcaseRoot().unit).toBe(0.5);
  });
});
