import { describe, expect, it } from "vitest";
import { PRODUCT_PACKAGING_IMAGE } from "./product-packaging";
import { productGalleryImages } from "./product-gallery-images";

const primaryUrl = "/products/example.png";
const assets = { [primaryUrl]: { model: "/model.jpg", detail: "/detail.jpg" } };

describe("productGalleryImages", () => {
  it("shows four ordered views and retains the product's original cover", () => {
    const images = [
      { id: "cover", url: primaryUrl },
      { id: "alternative", url: "/another-angle.jpg" },
    ];
    const gallery = productGalleryImages(images, assets);
    expect(gallery.map((image) => image.url)).toEqual([
      primaryUrl,
      "/model.jpg",
      "/detail.jpg",
      PRODUCT_PACKAGING_IMAGE,
    ]);
    expect(gallery[0]).toBe(images[0]);
    expect(gallery.slice(1).every((image) => image.isLifestyle)).toBe(true);
    expect(images).toHaveLength(2);
  });

  it("reuses existing images without duplicates and puts the packaging last", () => {
    const images = [
      { id: "cover", url: primaryUrl },
      { id: "package", url: PRODUCT_PACKAGING_IMAGE },
      { id: "detail", url: "/detail.jpg" },
      { id: "model", url: "/model.jpg" },
    ];
    const gallery = productGalleryImages(images, assets);
    expect(gallery.map((image) => image.id)).toEqual(["cover", "model", "detail", "package"]);
    expect(productGalleryImages(gallery, assets)).toEqual(gallery);
  });

  it("matches legacy jpeg names and absolute image URLs with cache parameters", () => {
    const images = [{ id: "cover", url: "https://shop.example/products/example.jpeg?v=old" }];
    expect(productGalleryImages(images, assets)).toHaveLength(4);
  });

  it("preserves unknown product galleries while adding missing packaging", () => {
    const images = [{ id: "custom", url: "/custom.jpg" }];
    expect(productGalleryImages(images, assets)[0]).toBe(images[0]);
    expect(productGalleryImages(images, assets)).toHaveLength(2);
  });
});
