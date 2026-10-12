// Makes the transparent product cut-outs the hero concepts float on the blue
// ground (Admin > Settings > Hero concepts).
//
//   npx tsx --env-file=.env.local scripts/hero-cutouts.ts [slug …]
//
// Every listed product's first studio photo (white ground, in public/products)
// goes through the same white-ground removal the admin image editor uses
// (src/lib/white-background.ts), is trimmed to the piece itself and saved as a
// WebP with transparency in public/hero/cutouts/<slug>.<hash>.webp. The list
// of what exists is written to src/lib/hero-concepts/cutouts.json, which the
// concepts read, so a product without a cut-out simply isn't offered.
//
// Read-only on the database. Re-running replaces the files; pass slugs to redo
// only those.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { db } from "../src/lib/db";
import { publicImageSrc } from "../src/lib/public-image";
import { removeWhiteBackground } from "../src/lib/white-background";

const OUT_DIR = join(process.cwd(), "public/hero/cutouts");
const MANIFEST = join(process.cwd(), "src/lib/hero-concepts/cutouts.json");
// Long edge before removal. The product photos are smaller than this, so in
// practice every pixel is kept: a piece drawn large needs all of them.
const WORK_EDGE = 2560;
// Higher than the editor's default (24): high enough to lift the studio's soft
// grey shadow, low enough to keep clear and white glass.
const TOLERANCE = Number(process.env.CUTOUT_TOLERANCE ?? 36);
// Enclosed white this large (a share of the photo) is the ground seen through a
// bracelet or a necklace's loop; smaller patches are glints and stay.
const HOLE_SHARE = 0.008;
// Opaque islands smaller than this share of the largest one are dust.
const MIN_ISLAND_SHARE = 0.02;
// White and milky glass reads as ground to the removal and comes out in pieces;
// these need a hand-made cut-out (the admin image editor) instead.
const EXCLUDE = new Set([
  "bracciale-perle-salvia-ottobre-2026",
  "bracciale-quadrati-miele-ottobre-2026",
  "bracciale-quadrati-rosa-ottobre-2026",
  "bracciale-quadrati-acqua-ottobre-2026",
  "bracciale-quadrati-neve-ottobre-2026",
  "orecchini-quadrati-neve-ottobre-2026",
  "orecchini-quadrati-rosa-ottobre-2026",
]);
// Only the studio shots of the October 2026 collection carry a cast shadow;
// the older photos are shadowless, and there the pass would grey white glass.
const SHADOWED = /\/new-2026-10\//;
// …except pale, nearly colourless glass (pastel pearls, sand, honey and pale
// aqua), which the pass mistakes for shadow. Their faint shadow stays.
const PALE = new Set([
  "bracciale-perle-rosa-ottobre-2026",
  "collana-perle-rosa-ottobre-2026",
  "collana-perle-salvia-ottobre-2026",
  "orecchini-perle-rosa-ottobre-2026",
  "orecchini-perle-salvia-ottobre-2026",
  "orecchini-quadrati-miele-ottobre-2026",
  "orecchini-arabeschi-sabbia-e-nero-ottobre-2026",
  "orecchini-medaglioni-rosa-e-sabbia-ottobre-2026",
  "orecchini-quadrati-acqua-ottobre-2026",
  "orecchini-sabbia-e-notte-ottobre-2026",
]);
// What counts as studio shadow: nearly colourless (channel spread), not darker
// than SHADOW_FLOOR, and changing by at most SHADOW_STEP between neighbours.
const SHADOW_CHROMA = 44;
const SHADOW_FLOOR = 110;
const SHADOW_STEP = 12;
// How dark the shadow lands on the blue (1 = as dark as in the photo).
const SHADOW_STRENGTH = 0.7;

/** Clears dust: opaque islands too small to be part of the piece. */
export function dropSpecks(pixels: Uint8ClampedArray, width: number, height: number) {
  const seen = new Uint8Array(width * height);
  const stack = new Uint32Array(width * height);
  const islands: number[][] = [];
  for (let start = 0; start < width * height; start++) {
    if (seen[start] || pixels[start * 4 + 3] < 24) continue;
    const island: number[] = [];
    let top = 0;
    stack[top++] = start;
    seen[start] = 1;
    while (top) {
      const index = stack[--top];
      island.push(index);
      const x = index % width;
      for (const next of [
        x > 0 ? index - 1 : -1,
        x < width - 1 ? index + 1 : -1,
        index >= width ? index - width : -1,
        index < width * (height - 1) ? index + width : -1,
      ]) {
        if (next < 0 || seen[next] || pixels[next * 4 + 3] < 24) continue;
        seen[next] = 1;
        stack[top++] = next;
      }
    }
    islands.push(island);
  }
  const largest = islands.reduce((most, island) => Math.max(most, island.length), 0);
  for (const island of islands) {
    if (island.length < Math.max(160, largest * MIN_ISLAND_SHARE)) {
      for (const index of island) pixels[index * 4 + 3] = 0;
    }
  }
}

/**
 * Turns the studio's soft grey shadow into a real one: from the cleared ground
 * inwards, smooth and colourless light-grey pixels become a translucent dark
 * shade, so on the blue they read as the piece's shadow instead of a pale
 * halo. Silver wire and clasps stop the spread (sharp contrast), and glints
 * inside the glass are never reached (they do not touch the ground).
 */
export function softenShadows(pixels: Uint8ClampedArray, width: number, height: number): number {
  // Pixels are judged as they looked in the photo (over white): the removal's
  // feathered edge stores un-mixed colours, whose steps would stop the spread.
  const tone = (index: number, channel: number) => {
    const o = index * 4;
    const alpha = pixels[o + 3] / 255;
    return pixels[o + channel] * alpha + 255 * (1 - alpha);
  };
  const light = (index: number) =>
    0.299 * tone(index, 0) + 0.587 * tone(index, 1) + 0.114 * tone(index, 2);
  const smooth = (index: number) => {
    const o = index * 4;
    if (pixels[o + 3] === 0) return false;
    const rgb = [tone(index, 0), tone(index, 1), tone(index, 2)];
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    if (max - min > SHADOW_CHROMA || min < SHADOW_FLOOR) return false;
    const here = light(index);
    const x = index % width;
    for (const next of [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      index >= width ? index - width : -1,
      index < width * (height - 1) ? index + width : -1,
    ]) {
      if (next >= 0 && pixels[next * 4 + 3] > 0 && Math.abs(light(next) - here) > SHADOW_STEP) return false;
    }
    return true;
  };
  const seen = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let tail = 0;
  for (let index = 0; index < width * height; index++) {
    if (pixels[index * 4 + 3] !== 0) continue;
    const x = index % width;
    for (const next of [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      index >= width ? index - width : -1,
      index < width * (height - 1) ? index + width : -1,
    ]) {
      if (next >= 0 && !seen[next] && smooth(next)) {
        seen[next] = 1;
        queue[tail++] = next;
      }
    }
  }
  for (let head = 0; head < tail; head++) {
    const index = queue[head];
    const x = index % width;
    for (const next of [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      index >= width ? index - width : -1,
      index < width * (height - 1) ? index + width : -1,
    ]) {
      if (next >= 0 && !seen[next] && smooth(next)) {
        seen[next] = 1;
        queue[tail++] = next;
      }
    }
  }
  // Applied after the spread, so every test above saw the original colours.
  const shades = Array.from(queue.subarray(0, tail), (index) =>
    Math.max(0, Math.min(1, ((255 - light(index)) / 255) * SHADOW_STRENGTH))
  );
  for (let at = 0; at < tail; at++) {
    const o = queue[at] * 4;
    pixels[o] = pixels[o + 1] = pixels[o + 2] = 0;
    pixels[o + 3] = Math.round(255 * shades[at]);
  }
  return tail;
}

type Cutout = {
  slug: string;
  src: string;
  width: number;
  height: number;
  kind: string;
  /** How far the piece's colours sit from the hero's blue (mean CIE76 ΔE):
   *  black and blue glass all but disappear on it. */
  contrast: number;
};

// The hero's ground, --site-primary.
const GROUND = [29, 78, 137];

function lab([r, g, b]: number[]) {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)];
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047);
  const y = f(0.2126 * lr + 0.7152 * lg + 0.0722 * lb);
  const z = f((0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** Mean colour difference between the visible pixels and the ground. */
function contrastOf(pixels: Uint8ClampedArray) {
  const ground = lab(GROUND);
  let sum = 0;
  let weight = 0;
  for (let o = 0; o < pixels.length; o += 4) {
    const alpha = pixels[o + 3] / 255;
    if (alpha < 0.5) continue;
    const [l, a, b] = lab([pixels[o], pixels[o + 1], pixels[o + 2]]);
    sum += alpha * Math.hypot(l - ground[0], a - ground[1], b - ground[2]);
    weight += alpha;
  }
  return weight ? Math.round(sum / weight) : 0;
}

const kindOf = (categorySlug: string | undefined) =>
  categorySlug?.startsWith("collan")
    ? "necklace"
    : categorySlug?.startsWith("braccial")
      ? "bracelet"
      : categorySlug?.startsWith("orecchin")
        ? "earrings"
        : "other";

/** Removes a product's earlier cut-outs (any version). */
function clearCutouts(slug: string) {
  for (const name of readdirSync(OUT_DIR)) {
    if (name === `${slug}.webp` || (name.startsWith(`${slug}.`) && name.endsWith(".webp")))
      rmSync(join(OUT_DIR, name), { force: true });
  }
}

/** Cuts a product photo out and saves it; returns its public address and size.
 *  The file name carries a hash of its contents: Next's image optimizer and
 *  the CDN keep a copy per address for a week, so a redone cut-out must get a
 *  new address to show. */
async function cut(file: string, slug: string) {
  const { data, info } = await sharp(file)
    .rotate()
    .resize({ width: WORK_EDGE, height: WORK_EDGE, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = removeWhiteBackground(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    TOLERANCE,
    Math.round(info.width * info.height * HOLE_SHARE)
  );
  if (SHADOWED.test(file) && !PALE.has(slug)) softenShadows(pixels, info.width, info.height);
  dropSpecks(pixels, info.width, info.height);
  // Trim to the piece, with a few pixels of air so a soft edge is not cut.
  const trimmed = await sharp(Buffer.from(pixels.buffer), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 90, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  const name = `${slug}.${createHash("sha256").update(trimmed.data).digest("hex").slice(0, 8)}.webp`;
  clearCutouts(slug);
  writeFileSync(join(OUT_DIR, name), trimmed.data);
  return {
    src: `/hero/cutouts/${name}`,
    width: trimmed.info.width,
    height: trimmed.info.height,
    contrast: contrastOf(pixels),
  };
}

async function main() {
  const only = new Set(process.argv.slice(2));
  mkdirSync(OUT_DIR, { recursive: true });
  const previous: Cutout[] = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
  const bySlug = new Map(previous.map((c) => [c.slug, c]));

  const products = await db.product.findMany({
    where: { active: true, unlisted: false, ...(only.size ? { slug: { in: [...only] } } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      category: { select: { slug: true } },
      images: { orderBy: { position: "asc" }, select: { url: true, isLifestyle: true } },
    },
  });

  for (const product of products) {
    if (EXCLUDE.has(product.slug)) {
      clearCutouts(product.slug);
      bySlug.delete(product.slug);
      continue;
    }
    const photo = product.images.find((image) => !image.isLifestyle);
    if (!photo || !photo.url.startsWith("/")) continue;
    const file = join(process.cwd(), "public", publicImageSrc(photo.url));
    if (!existsSync(file)) {
      console.warn(`skip ${product.slug}: ${file} is missing`);
      continue;
    }
    try {
      const size = await cut(file, product.slug);
      bySlug.set(product.slug, {
        slug: product.slug,
        ...size,
        kind: kindOf(product.category?.slug),
      });
      console.log(`ok   ${product.slug} ${size.width}x${size.height} contrast ${size.contrast}`);
    } catch (error) {
      console.warn(`skip ${product.slug}:`, error instanceof Error ? error.message : error);
    }
  }

  const list = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  mkdirSync(join(process.cwd(), "src/lib/hero-concepts"), { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify(list, null, 1)}\n`);
  console.log(`${list.length} cut-outs listed in ${MANIFEST}`);
}

// Run only when invoked directly, so the steps above can be imported (tests).
if (process.argv[1]?.endsWith("hero-cutouts.ts")) main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
