import { isOptimizableSrc } from "@/lib/image-hosts";
import { publicImageSrc } from "@/lib/public-image";
import { IMAGE_DEVICE_SIZES, IMAGE_SMALL_SIZES } from "@/lib/image-sizes";

/**
 * Addresses on Next's image optimizer for images that next/image can't render:
 * the page builder's HTML, CSS backgrounds, e-mails and social previews. The
 * optimizer resizes, re-encodes (WebP for browsers that accept it, the original
 * format for clients that don't, such as desktop Outlook) and caches.
 *
 * It only serves the widths and qualities allowlisted in next.config.ts, which
 * come from lib/image-sizes.ts, as these do.
 */
export const IMAGE_WIDTHS = [...IMAGE_SMALL_SIZES, ...IMAGE_DEVICE_SIZES] as const;

// Candidates offered to the browser in a srcset.
const SRCSET_WIDTHS = IMAGE_DEVICE_SIZES;

/** Whether the optimizer will take `src`: same-site paths without a query
 *  string (images.localPatterns) and allowlisted hosts; never SVG. */
export function canOptimize(src: string): boolean {
  if (/\.svg(?=[?#]|$)/i.test(src)) return false;
  if (src.startsWith("/") && /[?#]/.test(src)) return false;
  return isOptimizableSrc(src);
}

function optimizerUrl(src: string, width: number, quality: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

/** `src` resized to at least `width` pixels (the next size the optimizer
 *  offers), or unchanged when the optimizer can't take it. */
export function optimizedImageUrl(src: string, width: number, quality = 75): string {
  const url = publicImageSrc(src);
  if (!canOptimize(url)) return url;
  const w = IMAGE_WIDTHS.find((n) => n >= width) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  return optimizerUrl(url, w, quality);
}

/** A picture for link previews (Open Graph / Twitter cards, structured data):
 *  this site's files through the optimizer at 1200px, which also hands JPEG to
 *  crawlers that don't ask for WebP; pictures on other hosts unchanged. */
export function shareImageUrl(src: string): string {
  return src.startsWith("/") && !src.startsWith("//") ? optimizedImageUrl(src, 1200) : src;
}

/** A srcset of optimized widths for `src`, or undefined when the optimizer
 *  can't take it (the caller then uses the plain address). */
export function optimizedSrcSet(src: string, quality = 75): string | undefined {
  const url = publicImageSrc(src);
  if (!canOptimize(url)) return undefined;
  return SRCSET_WIDTHS.map((w) => `${optimizerUrl(url, w, quality)} ${w}w`).join(", ");
}
