/**
 * Read-only: reports which one-time setup steps are still missing in the
 * database, for scripts/apply-pending.sh. Changes nothing.
 *
 *   npx tsx scripts/pending-checklist.ts
 */
import { db } from "../src/lib/db";
import { LOOK_SIZE } from "../src/lib/looks";

async function main() {
  const [usZone, jpZone, settings, looks] = await Promise.all([
    db.shippingZone.findFirst({ where: { countries: { some: { country: "US" } } } }),
    db.shippingZone.findFirst({ where: { countries: { some: { country: "JP" } } } }),
    db.storeSettings.findFirst({ select: { freeShippingThreshold: true } }),
    db.look.findMany({
      where: { active: true },
      select: { products: { where: { active: true }, select: { id: true } } },
    }),
  ]);
  const liveLooks = looks.filter((l) => l.products.length === LOOK_SIZE).length;

  const line = (done: boolean, text: string) => console.log(`  ${done ? "✓" : "✗"} ${text}`);
  console.log("\nSetup status:");
  line(Boolean(usZone && jpZone), "Shipping zones for USA/Canada and the rest of the world");
  line(
    settings?.freeShippingThreshold === null,
    "Store-wide free-shipping threshold off (it would make paid zones free)"
  );
  line(
    liveLooks > 0,
    `Complete the Look sets live: ${liveLooks} (create them in Admin > Catalog > Looks)`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
