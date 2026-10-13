import { describe, expect, it } from "vitest";
import { popPosition } from "./pop-anchor";

const card = { width: 200, height: 100 };
const container = { width: 1000, height: 600 };

describe("popPosition", () => {
  it("opens below and to the right of the pointer", () => {
    expect(popPosition({ pointer: { x: 300, y: 200 }, card, container })).toEqual({ left: 316, top: 216, origin: "top left" });
  });
  it("flips left near the right edge and up near the bottom", () => {
    expect(popPosition({ pointer: { x: 950, y: 560 }, card, container })).toEqual({ left: 734, top: 444, origin: "bottom right" });
  });
  it("never leaves the container", () => {
    const small = { width: 180, height: 120 };
    const p = popPosition({ pointer: { x: 90, y: 60 }, card, container: small });
    expect(p.left).toBeGreaterThanOrEqual(8);
    expect(p.top).toBeGreaterThanOrEqual(8);
  });
});
