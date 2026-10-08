import { describe, expect, it } from "vitest";
import { removeWhiteBackground } from "./white-background";

const image = (values: number[][]) => new Uint8ClampedArray(values.flat());
const white = [255, 255, 255, 255];
const black = [0, 0, 0, 255];

describe("white background removal", () => {
  it("removes edge-connected white while preserving enclosed white and the original", () => {
    const pixels = image([
      white,
      white,
      white,
      white,
      white,
      white,
      black,
      black,
      black,
      white,
      white,
      black,
      white,
      black,
      white,
      white,
      black,
      black,
      black,
      white,
      white,
      white,
      white,
      white,
      white,
    ]);
    const output = removeWhiteBackground(pixels, 5, 5);
    expect(output[3]).toBe(0);
    expect(output[12 * 4 + 3]).toBe(255);
    expect(output[6 * 4 + 3]).toBe(255);
    expect(pixels[3]).toBe(255);
  });
  it("feathers near-white edges and increases removal with strength", () => {
    const pixels = image([[225, 225, 225, 255]]);
    expect(removeWhiteBackground(pixels, 1, 1, 24)[3]).toBe(128);
    expect(removeWhiteBackground(pixels, 1, 1, 40)[3]).toBe(0);
    expect(removeWhiteBackground(pixels, 1, 1, 0)[3]).toBe(255);
  });
  it("preserves existing transparency and colored foreground", () => {
    const pixels = image([
      [255, 255, 255, 0],
      [100, 0, 0, 128],
    ]);
    expect(Array.from(removeWhiteBackground(pixels, 2, 1))).toEqual(Array.from(pixels));
  });
  it("handles a single column and rejects invalid dimensions", () => {
    expect(removeWhiteBackground(image([white, black, white]), 1, 3)[11]).toBe(0);
    expect(() => removeWhiteBackground(image([white]), 2, 2)).toThrow();
    expect(() => removeWhiteBackground(image([white]), 0, 1)).toThrow();
  });
});
