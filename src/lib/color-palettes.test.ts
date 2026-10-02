import { describe, expect, it } from "vitest";
import {
  COLOR_PALETTES,
  THEME_PALETTE,
  findPalette,
  parseCustomPalettes,
  type CustomPalette,
} from "./color-palettes";
import { COLOR_ROLES, contrastReport, resolveColors } from "./site-style";

describe("colour palettes", () => {
  it("ships at least a few, each with a unique id and a name", () => {
    expect(COLOR_PALETTES.length).toBeGreaterThanOrEqual(6);
    const ids = COLOR_PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of COLOR_PALETTES) {
      expect(p.name.trim()).not.toBe("");
      expect(p.note.trim()).not.toBe("");
    }
  });

  it("defines every role as a six-digit hex", () => {
    for (const p of COLOR_PALETTES) {
      for (const role of COLOR_ROLES) {
        expect(p.colors[role], `${p.id}.${role}`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  /* The guarantee the catalogue makes: picking a palette from the list can
     never put the store below AA. A new palette that fails this belongs in
     the generator's reject pile, not in the dropdown. */
  it("every palette clears the contrast minimums", () => {
    for (const p of COLOR_PALETTES) {
      for (const r of contrastReport(p.colors)) {
        expect(r.passes, `${p.id}: ${r.label} is ${r.ratio}:1, needs ${r.min}:1`).toBe(true);
      }
    }
  });

  it("gives the accent a life of its own, apart from the body text", () => {
    for (const p of COLOR_PALETTES) {
      expect(p.colors.colorAccent, p.id).not.toBe(p.colors.colorText);
    }
  });

  it("recognises a palette it set, and nothing else", () => {
    for (const p of COLOR_PALETTES) {
      expect(findPalette(p.colors)?.id).toBe(p.id);
    }
    expect(findPalette({})).toBeNull();
    expect(findPalette({ colorText: "#123456" })).toBeNull();
  });

  it("treats an empty style as the theme's own colours", () => {
    expect(resolveColors({})).toEqual(THEME_PALETTE.colors);
  });
});

describe("custom palettes", () => {
  const colors = Object.fromEntries(
    COLOR_ROLES.map((r) => [r, "#123456"])
  ) as CustomPalette["colors"];
  const good: CustomPalette = { id: "custom-1", name: "Autumn window", colors };

  it("reads a well-formed palette back", () => {
    expect(parseCustomPalettes([good])).toEqual([good]);
  });

  /* The column is JSON, so it can hold anything a hand-edited row or an older
     version left there. None of it may reach a style attribute. */
  it("drops anything malformed rather than trusting it", () => {
    expect(parseCustomPalettes(null)).toEqual([]);
    expect(parseCustomPalettes("nope")).toEqual([]);
    expect(parseCustomPalettes([null, 7, "x"])).toEqual([]);
    expect(parseCustomPalettes([{ ...good, name: "   " }])).toEqual([]);
    expect(parseCustomPalettes([{ ...good, colors: { colorText: "#fff" } }])).toEqual([]);
    expect(
      parseCustomPalettes([
        { ...good, colors: { ...good.colors, colorAccent: "red; }" } },
      ])
    ).toEqual([]);
  });

  it("is found by findPalette, and wins over a bundled one it matches", () => {
    expect(findPalette(good.colors, [good])?.id).toBe("custom-1");
    const shadow = { ...good, colors: COLOR_PALETTES[0].colors };
    expect(findPalette(COLOR_PALETTES[0].colors, [shadow])?.id).toBe("custom-1");
  });
});
