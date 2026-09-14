/**
 * Secure local product-image importer — turns a folder of photos into
 * Product rows with images, one product per image.
 *
 * Usage:
 *   npx tsx scripts/import-products.ts <sourceDir> --category "Category name" [options]
 *
 * Options:
 *   --category-slug <slug>     defaults to a slugified --category
 *   --category-it <name>       Italian category name (optional, cosmetic only —
 *                               Category has one `name`, so this just controls
 *                               what gets stored if you prefer Italian)
 *   --manifest <file.json>     optional: { "<filename>": { name, description } }
 *                               overrides for specific files; anything not
 *                               listed falls back to an auto-generated name
 *   --price-min <euros>        default 20
 *   --price-max <euros>        default 60
 *   --currency <code>          default EUR
 *   --sku-prefix <text>        default derived from --category-slug
 *   --dry-run                  print what would happen, write nothing
 *
 * Example — the Murano jewelry catalog this project ships with:
 *   npx tsx scripts/import-products.ts ../Murano \
 *     --category "Bracciali" --price-min 29 --price-max 68 \
 *     --manifest scripts/murano-manifest.json
 *
 * ---------------------------------------------------------------------------
 * Why this is safe to run, and why it must never become a web upload route
 * ---------------------------------------------------------------------------
 * This is a developer/admin-run CLI tool with direct filesystem + database
 * access — the same trust level as `prisma/seed.ts`. It never runs on the
 * public server and never accepts input over the network, so it doesn't
 * carry the risks a customer- or even admin-facing upload *endpoint* would
 * (unauthenticated access, disguised-file attacks at scale, storage
 * exhaustion from the public internet). It still validates its input
 * defensively, because "trusted operator" doesn't mean "trust the file":
 *
 *  - Every file must have an allowed image extension AND matching magic
 *    bytes (the first few bytes of the actual file) — a renamed .exe or
 *    .html doesn't pass as a .jpg just because of its extension.
 *  - Destination filenames are derived from a slug, never from the
 *    original filename directly — no path traversal, no surprises from
 *    special characters.
 *  - A max file size (15 MB) guards against accidentally copying something
 *    huge into `public/`.
 *  - Files are COPIED, never moved or deleted — your source folder is
 *    never modified.
 *  - Re-running against the same folder is safe: a product whose image URL
 *    already exists in the database is skipped, not duplicated.
 *
 * If you ever want customers or staff to upload images through the website
 * itself, that is a materially different feature — it needs auth, a
 * malware/AV scan, and server-side storage (S3/Cloudinary), not this
 * script. See README "Images".
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  copyFileSync,
  openSync,
  readSync,
  closeSync,
} from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";

const MAX_FILE_BYTES = 15 * 1024 * 1024;

const SIGNATURES: { ext: string[]; check: (buf: Buffer) => boolean }[] = [
  { ext: [".jpg", ".jpeg"], check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: [".png"],
    check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: [".webp"],
    check: (b) =>
      b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP",
  },
];

function isGenuineImage(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const rule = SIGNATURES.find((s) => s.ext.includes(ext));
  if (!rule) return false;
  const head = Buffer.alloc(12);
  const fd = openSync(filePath, "r");
  readSync(fd, head, 0, 12, 0);
  closeSync(fd);
  return rule.check(head);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (NFKD splits e.g. "à" into "a" + combining mark)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      flags[key] = value;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type ManifestEntry = { name?: string; description?: string; category?: string };

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const sourceDir = positional[0];
  if (!sourceDir || !existsSync(sourceDir) || !statSync(sourceDir).isDirectory()) {
    console.error('Usage: tsx scripts/import-products.ts <sourceDir> --category "Name" [options]');
    process.exit(1);
  }

  const categoryName = flags.category;
  if (!categoryName && !flags.manifest) {
    console.error('Pass --category "Name" (or give every file a category in --manifest).');
    process.exit(1);
  }

  const priceMinCents = Math.round(Number(flags["price-min"] ?? 20) * 100);
  const priceMaxCents = Math.round(Number(flags["price-max"] ?? 60) * 100);
  const currency = flags.currency ?? "EUR";
  const dryRun = flags["dry-run"] === "true";

  const manifest: Record<string, ManifestEntry> = flags.manifest
    ? JSON.parse(readFileSync(flags.manifest, "utf-8"))
    : {};

  const categoryCache = new Map<string, string>(); // name -> id

  async function getOrCreateCategory(name: string) {
    if (categoryCache.has(name)) return categoryCache.get(name)!;
    const slug =
      flags["category-slug"] && categoryName === name ? flags["category-slug"] : slugify(name);
    let category = await db.category.findUnique({ where: { slug } });
    if (!category) {
      if (dryRun) {
        console.log(`[dry-run] would create category "${name}" (${slug})`);
        categoryCache.set(name, "dry-run-id");
        return "dry-run-id";
      }
      category = await db.category.create({ data: { name, slug } });
      console.log(`Created category "${name}" (${slug})`);
    }
    categoryCache.set(name, category.id);
    return category.id;
  }

  const files = readdirSync(sourceDir)
    .filter((f) => [".jpg", ".jpeg", ".png", ".webp"].includes(path.extname(f).toLowerCase()))
    .sort();

  if (files.length === 0) {
    console.error(`No image files found in ${sourceDir}`);
    process.exit(1);
  }

  const seenHashes = new Set<string>();
  let created = 0;
  let skippedDuplicateContent = 0;
  let skippedInvalid = 0;
  let skippedExisting = 0;

  const skuCounters = new Map<string, number>();
  function nextSku(productCategory: string) {
    const prefix = (flags["sku-prefix"] ?? slugify(productCategory).split("-")[0] ?? "product")
      .toUpperCase()
      .slice(0, 12);
    const n = (skuCounters.get(prefix) ?? 0) + 1;
    skuCounters.set(prefix, n);
    return `${prefix}-${String(n).padStart(3, "0")}`;
  }

  for (const file of files) {
    const fullPath = path.join(sourceDir, file);
    const stat = statSync(fullPath);

    if (stat.size > MAX_FILE_BYTES) {
      console.warn(`Skipping ${file}: exceeds ${MAX_FILE_BYTES / 1024 / 1024}MB`);
      skippedInvalid++;
      continue;
    }
    if (!isGenuineImage(fullPath)) {
      console.warn(`Skipping ${file}: not a recognized image (extension/content mismatch)`);
      skippedInvalid++;
      continue;
    }

    const contentHash = createHash("sha256").update(readFileSync(fullPath)).digest("hex");
    if (seenHashes.has(contentHash)) {
      skippedDuplicateContent++;
      continue; // exact duplicate photo already processed in this run
    }
    seenHashes.add(contentHash);

    const entry = manifest[file] ?? {};
    const productCategory = entry.category ?? categoryName!;
    const categoryId = await getOrCreateCategory(productCategory);
    const sku = nextSku(productCategory);

    const baseName = entry.name ?? `${productCategory} ${sku}`;
    const slug = slugify(`${baseName}-${contentHash.slice(0, 6)}`);
    const destDir = path.join("public", "products", slugify(productCategory));
    const destFilename = `${slug}${path.extname(file).toLowerCase()}`;
    const publicUrl = `/products/${slugify(productCategory)}/${destFilename}`;

    const alreadyImported = await db.productImage.findFirst({ where: { url: publicUrl } });
    if (alreadyImported) {
      skippedExisting++;
      continue;
    }

    const description =
      entry.description ??
      `${baseName} — handcrafted piece, part of our ${productCategory.toLowerCase()} collection.`;
    const price = randomInt(priceMinCents, priceMaxCents);
    const stockQty = randomInt(1, 6);

    if (dryRun) {
      console.log(
        `[dry-run] would import ${file} -> "${baseName}" (${sku}, ${(price / 100).toFixed(2)} ${currency}, stock ${stockQty})`
      );
      created++;
      continue;
    }

    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
    copyFileSync(fullPath, path.join(destDir, destFilename));

    await db.product.create({
      data: {
        name: baseName,
        slug,
        description,
        price,
        currency,
        sku,
        stockQty,
        lowStockThreshold: 2,
        active: true,
        categoryId,
        images: { create: [{ url: publicUrl, altText: baseName, position: 0 }] },
      },
    });

    console.log(
      `Imported ${file} -> "${baseName}" (${sku}, ${(price / 100).toFixed(2)} ${currency})`
    );
    created++;
  }

  console.log(
    `\nDone. ${created} product(s) ${dryRun ? "would be " : ""}created, ${skippedDuplicateContent} duplicate photo(s) skipped, ${skippedExisting} already-imported skipped, ${skippedInvalid} invalid file(s) skipped.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
