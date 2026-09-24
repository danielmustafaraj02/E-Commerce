/**
 * Creates the "Complete the look" sets below (same result as Admin > Catalog
 * > Looks > New look). Safe to re-run: a look that already exists by name is
 * left alone. Optionally swaps back the photos of two earrings that show each
 * other's picture on the live site.
 *
 * Usage:
 *   npx tsx scripts/create-looks.ts --dry-run
 *   npx tsx scripts/create-looks.ts
 *   npx tsx scripts/create-looks.ts --swap-earring-photos   # also fixes the photos
 */
import { db } from "../src/lib/db";

// Matched against the owner's photos of each set: [necklace, bracelet, earrings].
const LOOKS = [
  {
    name: "Rosa e Salvia",
    slugs: [
      "collana-perla-rosa-antico-f396d8",
      "bracciale-polvere-d-oro-rosa-380f82",
      "orecchini-giardino-pastello-d650a2",
    ],
  },
  {
    name: "Rosso Rubino",
    slugs: [
      "collana-fiamma-scarlatta-17effb",
      "bracciale-fuoco-di-granato-9ff520",
      "orecchini-goccia-di-rubino-9ad623",
    ],
  },
];

// "Goccia di Rubino" (a ruby-red drop, per its description) shows the pink
// earrings' photo, and "Petalo di Rosa" (streaked pink) shows the red ones.
const SWAPPED_EARRINGS = ["orecchini-goccia-di-rubino-9ad623", "orecchini-petalo-di-rosa-e081a0"];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const swapPhotos = process.argv.includes("--swap-earring-photos");
  const log = (msg: string) => console.log(`${dryRun ? "[dry-run] " : ""}${msg}`);

  for (const look of LOOKS) {
    const existing = await db.look.findFirst({ where: { name: look.name } });
    if (existing) {
      log(`Look "${look.name}" already exists, skipping.`);
      continue;
    }
    const products = await db.product.findMany({
      where: { slug: { in: look.slugs } },
      select: { id: true, slug: true, name: true, active: true, look: { select: { name: true } } },
    });
    const missing = look.slugs.filter((s) => !products.some((p) => p.slug === s));
    if (missing.length) {
      console.error(`Look "${look.name}": product(s) not found: ${missing.join(", ")} — skipped.`);
      process.exitCode = 1;
      continue;
    }
    log(`Look "${look.name}" (15% off the set):`);
    for (const p of products) {
      const notes = [
        !p.active && "INACTIVE — the set stays hidden until it's active",
        p.look && `moves out of look "${p.look.name}"`,
      ].filter(Boolean);
      log(`  - ${p.name}${notes.length ? ` (${notes.join("; ")})` : ""}`);
    }
    if (!dryRun) {
      await db.$transaction(async (tx) => {
        const created = await tx.look.create({ data: { name: look.name, discountPercent: 15 } });
        await tx.product.updateMany({
          where: { id: { in: products.map((p) => p.id) } },
          data: { lookId: created.id },
        });
      });
    }
  }

  if (swapPhotos) {
    const [a, b] = await Promise.all(
      SWAPPED_EARRINGS.map((slug) =>
        db.product.findUnique({
          where: { slug },
          select: { id: true, name: true, images: { orderBy: { position: "asc" } } },
        })
      )
    );
    if (!a || !b) {
      console.error("Earrings not found — photos not swapped.");
      process.exitCode = 1;
    } else if (a.images[0]?.url.includes("goccia-di-rubino")) {
      log("Earring photos already match their names, skipping.");
    } else {
      log(`Swapping photos: "${a.name}" <-> "${b.name}"`);
      if (!dryRun) {
        // Move each product's whole set of photos to the other one (they may
        // have different numbers of photos). Rows are recreated rather than
        // re-pointed, with the receiving product's name as alt text.
        const photos = (from: typeof a, to: typeof a) =>
          from.images.map((image) => ({
            productId: to.id,
            url: image.url,
            altText: to.name,
            position: image.position,
            isLifestyle: image.isLifestyle,
          }));
        await db.$transaction([
          db.productImage.deleteMany({ where: { productId: { in: [a.id, b.id] } } }),
          db.productImage.createMany({ data: [...photos(a, b), ...photos(b, a)] }),
        ]);
      }
    }
  }

  log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
