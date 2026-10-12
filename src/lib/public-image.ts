/**
 * Photos bundled with the site live in these public/ folders and are stored as
 * WebP: scripts/optimize-images.mjs converts every .jpg/.jpeg/.png placed there
 * (it keeps its own copy of this list; public-image.test.ts checks they match).
 */
export const PHOTO_DIRS = ["products", "hero", "about", "blog", "gift-card", "decor"] as const;

const LEGACY_PHOTO = new RegExp(
  `^(/(?:${PHOTO_DIRS.join("|")})/[^?#]+)\\.(?:jpe?g|png)(?=[?#]|$)`,
  "i"
);

/**
 * The current address of a bundled photo. Database rows and saved page designs
 * written before the WebP conversion still name the .jpg/.jpeg/.png originals;
 * those map to the WebP that replaced them. Anything else (uploads, other
 * hosts, SVGs, the root logos) is returned unchanged.
 */
export function publicImageSrc(src: string): string {
  return src.replace(LEGACY_PHOTO, "$1.webp");
}

/**
 * next.config.ts rewrite: a request for a bundled photo's old .jpg/.jpeg/.png
 * address serves its WebP when the original file is gone, so links in sent
 * e-mails, search results and older pages keep working.
 */
export const legacyPhotoRewrite = {
  source: `/:dir(${PHOTO_DIRS.join("|")})/:path(.+)\\.:ext(jpe?g|png|JPE?G|PNG)`,
  destination: "/:dir/:path.webp",
};
