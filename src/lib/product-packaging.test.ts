import { describe, expect, it } from "vitest";
import { PRODUCT_PACKAGING_IMAGE, withProductPackaging } from "./product-packaging";

describe("withProductPackaging", () => {
  it("appends packaging after all original photos without changing the source", () => {
    const images = [
      { id: "first", url: "/first.png" },
      { id: "last", url: "/last.png" },
    ];
    const result = withProductPackaging(images);
    expect(result.slice(0, -1)).toEqual(images);
    expect(result.at(-1)?.url).toBe(PRODUCT_PACKAGING_IMAGE);
    expect(images).toHaveLength(2);
    expect(withProductPackaging(result)).toBe(result);
  });

  it("leaves existing packaging and its position untouched", () => {
    const images = [
      { id: "package", url: PRODUCT_PACKAGING_IMAGE },
      { id: "last", url: "/last.png" },
    ];
    expect(withProductPackaging(images)).toBe(images);
  });

  it("recognizes an existing absolute URL with query parameters", () => {
    const images = [{ id: "package", url: `https://shop.example${PRODUCT_PACKAGING_IMAGE}?v=2` }];
    expect(withProductPackaging(images)).toBe(images);
  });
});
