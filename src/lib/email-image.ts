import { absoluteUrl } from "@/lib/json-ld";

// Mail clients load pictures from the open web, so an email's image address must
// be complete (https://shop/...): the catalog stores local pictures as
// "/products/..." which an inbox can't resolve, so they showed as broken images.
export function emailAbsoluteUrl(url: string | null | undefined, base: string): string | null {
  return url ? absoluteUrl(url, base) : null;
}

// A small thumbnail for a product row. The catalog's own files are large (some over
// 1 MB) and an email shows them at ~56px, so local pictures go through the site's
// image resizer at 128px wide (crisp on a 2x screen); pictures on other hosts are
// used as they are.
export function emailThumbnailUrl(url: string | null | undefined, base: string): string | null {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return `${base.replace(/\/+$/, "")}/_next/image?url=${encodeURIComponent(url)}&w=128&q=75`;
  }
  return absoluteUrl(url, base);
}
