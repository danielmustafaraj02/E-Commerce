// The widths and qualities Next's image optimizer will produce, in one place:
// next.config.ts allowlists them, and lib/optimized-image.ts builds optimizer
// addresses by hand (e-mails, social previews, builder backgrounds) from the
// same lists, so the two can never disagree (an address the optimizer refuses
// is a broken image).
//
// Every width is another stored copy of every photo, and each copy counts
// against the host's image-transformation quota, so the lists are short.

/** Full-width photos: phones (640, 828 for 2x screens), laptops, large screens. */
export const IMAGE_DEVICE_SIZES = [640, 828, 1200, 1920] as const;

/** Thumbnails and small tiles (only for images with a `sizes` hint). */
export const IMAGE_SMALL_SIZES = [64, 128, 256, 384] as const;

/** 90 for catalog and hero photos, 75 (the default) elsewhere, 95 for the
 *  nav-dropdown thumbnails, which are scaled up on retina screens. */
export const IMAGE_QUALITIES = [75, 90, 95] as const;
