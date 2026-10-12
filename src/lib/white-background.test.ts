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
  it("removes enclosed white only when the area reaches minHoleArea", () => {
    // A 5x5 black ring around a 3x3 white hole, framed by white.
    const size = 7;
    const pixels = image(
      Array.from({ length: size * size }, (_, i) => {
        const x = i % size;
        const y = Math.floor(i / size);
        const ring = (x === 1 || x === 5 || y === 1 || y === 5) && x >= 1 && x <= 5 && y >= 1 && y <= 5;
        return ring ? black : white;
      })
    );
    const centre = (3 * size + 3) * 4 + 3;
    expect(removeWhiteBackground(pixels, size, size)[centre]).toBe(255);
    expect(removeWhiteBackground(pixels, size, size, 24, 10)[centre]).toBe(255);
    expect(removeWhiteBackground(pixels, size, size, 24, 9)[centre]).toBe(0);
    expect(removeWhiteBackground(pixels, size, size, 24, 9)[(1 * size + 1) * 4 + 3]).toBe(255);
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
