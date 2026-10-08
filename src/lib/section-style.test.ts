import { describe, expect, it } from "vitest";
import { parseStyle, resolveLayout, HOME_SECTIONS } from "./page-layout";
import { sectionInlineStyle } from "./section-style";

describe("section background controls", () => {
  it("preserves custom background placement and spacing through saving", () => {
    const stored = {
      bg: "#e7e4dc",
      bgImage: "/products/photo.png",
      bgFit: "custom",
      bgScale: 175,
      bgPositionX: 25,
      bgPositionY: 80,
      bgRepeat: "repeat-x",
      padInline: 2,
      padTop: 1,
      padBottom: 3,
      radius: 1.5,
    };
    const layout = resolveLayout([{ id: "hero", visible: true, style: stored }], HOME_SECTIONS);
    const saved = layout.find((entry) => entry.id === "hero")!.style!;
    expect(saved).toMatchObject(stored);
    expect(sectionInlineStyle(saved)).toMatchObject({
      background: "#e7e4dc",
      backgroundImage: 'url("/products/photo.png")',
      backgroundSize: "175% auto",
      backgroundPosition: "25% 80%",
      backgroundRepeat: "repeat-x",
      paddingInline: "2rem",
      paddingTop: "1rem",
      paddingBottom: "3rem",
      borderRadius: "1.5rem",
      overflow: "hidden",
    });
  });
  it("retains centered cover defaults and supports contain and tiling", () => {
    expect(sectionInlineStyle({ bgImage: "/photo.png" })).toMatchObject({
      backgroundSize: "cover",
      backgroundPosition: "50% 50%",
      backgroundRepeat: "no-repeat",
    });
    expect(
      sectionInlineStyle({ bgImage: "/photo.png", bgFit: "contain", bgRepeat: "repeat" })
    ).toMatchObject({ backgroundSize: "contain", backgroundRepeat: "repeat" });
  });
  it("clamps controls and discards unsafe options", () => {
    const parsed = parseStyle({
      bgPositionX: -3,
      bgPositionY: 999,
      bgScale: 999,
      padInline: -1,
      radius: 99,
      bgFit: "unsafe",
      bgRepeat: "bad",
      bgImage: "javascript:bad",
    })!;
    expect(parsed).toMatchObject({
      bgPositionX: 0,
      bgPositionY: 100,
      bgScale: 300,
      padInline: 0,
      radius: 8,
    });
    expect(parsed.bgFit).toBeUndefined();
    expect(parsed.bgRepeat).toBeUndefined();
    expect(parsed.bgImage).toBeUndefined();
    expect(
      parseStyle({ bgPositionX: NaN, bgPositionY: Infinity, bgScale: NaN, radius: Infinity })
    ).toBeUndefined();
  });
  it("ignores image placement without an image and keeps gradients and overlays", () => {
    const css = sectionInlineStyle({
      bgPositionX: 0,
      bgScale: 200,
      gradFrom: "#fff",
      gradTo: "#000",
      overlayColor: "#000",
      overlayStrength: 50,
    });
    expect(css.backgroundImage).toContain("linear-gradient");
    expect(css.backgroundPosition).toBeUndefined();
    expect(css.backgroundSize).toBeUndefined();
    expect(css.position).toBe("relative");
  });
});
