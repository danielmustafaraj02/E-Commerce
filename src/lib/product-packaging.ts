import { publicImageSrc } from "./public-image";

export const PRODUCT_PACKAGING_IMAGE =
  "/products/orecchini-in-vetro-di-murano/orecchini-goccia-di-rubino-3.webp";

type GalleryImage = { id: string; url: string; isLifestyle?: boolean };

/** Keep existing photos in place; append the shared gift packaging only when absent. */
export function withProductPackaging(images: GalleryImage[]): GalleryImage[] {
  const hasPackaging = images.some((image) => {
    try {
      // Rows saved before the WebP conversion name the packaging photo's .png.
      const path = new URL(image.url, "https://catalog.invalid").pathname;
      return publicImageSrc(path) === PRODUCT_PACKAGING_IMAGE;
    } catch {
      return false;
    }
  });
  if (hasPackaging) return images;
  return [
    ...images,
    { id: "shared-product-packaging", url: PRODUCT_PACKAGING_IMAGE, isLifestyle: true },
  ];
}
