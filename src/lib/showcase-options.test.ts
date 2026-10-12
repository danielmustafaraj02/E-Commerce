import { describe, expect, it } from "vitest";
import {
  parseSceneOverride,
  parseShowcaseScroll,
  showcaseRoot,
  showcaseImageVars,
  showcaseElementVars,
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

describe("collection picture sizing", () => {
  it("preserves scene geometry through saved builder parsing", () => {
    const doc = parseBuilder({ columns: 1, cells: [[{ type: "showcase", scenes: {
      necklace: { imageScale: 140, imageX: -15, imageY: 10 },
    } }]] });
    const block = doc!.cells[0][0];
    expect(block.type).toBe("showcase");
    if (block.type !== "showcase") return;
    expect(showcaseImageVars(block.scenes?.necklace)).toEqual({
      "--sc-image-scale": "1.4", "--sc-image-x": "-15%", "--sc-image-y": "10%",
    });
    expect(showcaseImageVars()).toEqual({
      "--sc-image-scale": "1", "--sc-image-x": "0%", "--sc-image-y": "0%",
    });
  });
  it("clamps sizes and positions and rejects non-finite input", () => {
    expect(parseSceneOverride({ imageScale: 999, imageX: -999, imageY: NaN })).toMatchObject({
      imageScale: 250, imageX: -50, imageY: undefined,
    });
  });
});

it("preserves the optional full-screen mode", () => {
  const options = parseShowcaseScroll({ fullScreen: true });
  expect(options?.fullScreen).toBe(true);
  expect(showcaseRoot(options).attrs).toHaveProperty("data-full-screen", "");
  expect(showcaseRoot(parseShowcaseScroll({ fullScreen: false })).attrs).not.toHaveProperty("data-full-screen");
});

it("preserves independent geometry for every editable scene element", () => {
  const scene = parseSceneOverride({ titleScale: 140, titleX: 25, descriptionY: -20, counterScale: 80, buttonX: 10 });
  expect(showcaseElementVars(scene)).toMatchObject({
    "--sc-title-scale": "1.4", "--sc-title-x": "25%", "--sc-description-y": "-20%",
    "--sc-counter-scale": "0.8", "--sc-button-x": "10%",
  });
});
