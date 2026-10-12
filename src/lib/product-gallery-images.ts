import catalogAssets from "./product-gallery-assets.json";
import { PRODUCT_PACKAGING_IMAGE, withProductPackaging } from "./product-packaging";
import { publicImageSrc } from "./public-image";

type GalleryImage = { id: string; url: string; isLifestyle?: boolean };
type GallerySupplement = { model: string; detail: string };
const supplements: Record<string, GallerySupplement> = catalogAssets;

// Compared by path, with the .jpg/.jpeg/.png names of photos that are WebP now
// treated as the WebP (rows and keys may use either).
function imagePath(url: string): string {
  try {
    return publicImageSrc(new URL(url, "https://catalog.invalid").pathname);
  } catch {
    return url;
  }
}

/** The catalogue's four views: product, worn, detail, then gift packaging. */
export function productGalleryImages(
  images: GalleryImage[],
  assets: Record<string, GallerySupplement> = supplements
): GalleryImage[] {
  const byPath = new Map(Object.entries(assets).map(([key, views]) => [imagePath(key), views]));
  const primary = images.find((image) => byPath.has(imagePath(image.url)));
  if (!primary) return withProductPackaging(images);
  const views = byPath.get(imagePath(primary.url))!;
  const packaging = images.find((image) => imagePath(image.url) === PRODUCT_PACKAGING_IMAGE);
  const existing = (url: string, suffix: string): GalleryImage => {
    const image = images.find((candidate) => imagePath(candidate.url) === imagePath(url));
    return image
      ? { ...image, isLifestyle: true }
      : { id: `${primary.id}:${suffix}`, url, isLifestyle: true };
  };
  return [
    primary,
    existing(views.model, "model"),
    existing(views.detail, "detail"),
    packaging
      ? { ...packaging, isLifestyle: true }
      : { id: `${primary.id}:packaging`, url: PRODUCT_PACKAGING_IMAGE, isLifestyle: true },
  ];
}
