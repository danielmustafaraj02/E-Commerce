import { describe, expect, it } from "vitest";
import { PALETTE_VARIANTS, paletteFromColour } from "./palette-from-colour";
import { COLOR_ROLES, contrastReport } from "./site-style";

describe("paletteFromColour", () => {
  it("returns every role as a six-digit hex", () => {
    const p = paletteFromColour("#3b82f6")!;
    for (const role of COLOR_ROLES) expect(p[role]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("rejects things that are not colours", () => {
    expect(paletteFromColour("blue")).toBeNull();
    expect(paletteFromColour("url(javascript:x)")).toBeNull();
    expect(paletteFromColour("")).toBeNull();
  });

  it("always clears the contrast minimums, whatever colour and variant", () => {
    const hues = Array.from({ length: 36 }, (_, i) => i * 10);
    const levels = [0.25, 0.5, 0.85];
    for (const variant of PALETTE_VARIANTS) {
      for (const h of hues) {
        for (const s of levels) {
          for (const l of [0.3, 0.5, 0.75]) {
            const hex = hsl(h, s, l);
            const p = paletteFromColour(hex, variant.id)!;
            for (const r of contrastReport(p)) {
              expect(r.passes, `${variant.id} ${hex}: ${r.label} ${r.ratio}:1`).toBe(true);
            }
          }
        }
      }
    }
  });

  it("keeps the accent apart from the body text", () => {
    const p = paletteFromColour("#1b7f8c")!;
    expect(p.colorAccent).not.toBe(p.colorText);
  });

  it("gives the three variants a different page colour", () => {
    const [a, b, c] = PALETTE_VARIANTS.map(
      (v) => paletteFromColour("#7054b8", v.id)!.colorBackground
    );
    expect(new Set([a, b, c]).size).toBe(3);
  });
});

function hsl(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  const f = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}
