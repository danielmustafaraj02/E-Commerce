import { describe, expect, it } from "vitest";
import { lookComposition } from "./look-composition";

const set = (selected: [boolean, boolean, boolean]) =>
  lookComposition([
    { kind: "bracelet", selected: selected[0] },
    { kind: "necklace", selected: selected[1] },
    { kind: "earrings", selected: selected[2] },
  ]);

describe("lookComposition", () => {
  it("puts the necklace large in the centre with the others either side", () => {
    const [bracelet, necklace, earrings] = set([true, true, true]);
    expect(necklace.desktop.x).toBe(0.5);
    expect(necklace.desktop.s).toBeGreaterThan(bracelet.desktop.s);
    expect(bracelet.desktop.x).toBeLessThan(0.5);
    expect(earrings.desktop.x).toBeGreaterThan(0.5);
    expect(earrings.desktop.y).toBeGreaterThan(bracelet.desktop.y);
    // Phones: necklace on top, the other two below it.
    expect(necklace.mobile.y).toBeLessThan(bracelet.mobile.y);
    expect([bracelet, necklace, earrings].every((p) => p.visible)).toBe(true);
  });

  it("rebalances two pieces instead of leaving a gap", () => {
    const [bracelet, necklace, earrings] = set([false, true, true]);
    expect(bracelet.visible).toBe(false);
    expect(necklace.desktop.x).not.toBe(0.5);
    expect(necklace.desktop.s).toBeGreaterThan(earrings.desktop.s);
    expect(earrings.desktop.x).toBeGreaterThan(necklace.desktop.x);
  });

  it("gives two equal pieces when the necklace is removed", () => {
    const [bracelet, , earrings] = set([true, false, true]);
    expect(bracelet.desktop.s).toBe(earrings.desktop.s);
    expect(bracelet.desktop.x).toBeLessThan(earrings.desktop.x);
  });

  it("centres a single piece", () => {
    const [bracelet] = set([true, false, false]);
    expect(bracelet.desktop).toMatchObject({ x: 0.5, y: 0.5 });
    expect(bracelet.visible).toBe(true);
  });

  it("hides everything when nothing is selected, keeping each piece's resting place", () => {
    const placements = set([false, false, false]);
    expect(placements.every((p) => !p.visible)).toBe(true);
    expect(placements[1].desktop.x).toBe(0.5);
  });

  it("keeps every piece fully inside the showcase", () => {
    const states: [boolean, boolean, boolean][] = [
      [true, true, true],
      [false, true, true],
      [true, false, true],
      [true, true, false],
      [true, false, false],
    ];
    for (const state of states) {
      for (const p of set(state).filter((p) => p.visible)) {
        for (const slot of [p.desktop, p.mobile]) {
          expect(slot.y - slot.s / 2).toBeGreaterThanOrEqual(-0.001);
          expect(slot.y + slot.s / 2).toBeLessThanOrEqual(1.001);
        }
      }
    }
  });
});
