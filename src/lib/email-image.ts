import { absoluteUrl } from "@/lib/json-ld";
import { canOptimize, optimizedImageUrl } from "@/lib/optimized-image";
import { PHOTO_QUALITY } from "@/lib/image-sizes";
import { publicImageSrc } from "@/lib/public-image";

// Mail clients load pictures from the open web, so an email's image address must
// be complete (https://shop/...): the catalog stores local pictures as
// "/products/..." which an inbox can't resolve, so they showed as broken images.
//
// Desktop Outlook shows no WebP, which is what the site's photos (and uploads)
// are stored as. Those go through the site's image optimizer, which answers a
// client that doesn't ask for WebP with JPEG; PNG and JPEG files are linked as
// they are, so a transparent logo stays transparent.
export function emailAbsoluteUrl(url: string | null | undefined, base: string): string | null {
  if (!url) return null;
  const src = publicImageSrc(url);
  if (/\.webp(?=[?#]|$)/i.test(src) && canOptimize(src)) {
    return absoluteUrl(optimizedImageUrl(src, 384, PHOTO_QUALITY), base);
  }
  return absoluteUrl(src, base);
}

// A small thumbnail for a product row. Product photos are far larger than the
// ~56px an email shows, so pictures the optimizer can take (this site's files
// and the allowlisted upload host) go through it at 128px wide (crisp on a 2x
// screen); pictures on other hosts are used as they are.
export function emailThumbnailUrl(url: string | null | undefined, base: string): string | null {
  if (!url) return null;
  const src = publicImageSrc(url);
  return absoluteUrl(canOptimize(src) ? optimizedImageUrl(src, 128, PHOTO_QUALITY) : src, base);
}
