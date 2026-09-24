/**
 * Makes the shipping zones match the store policy (scripts/shipping-zones.ts):
 * free across Europe (EU + UK, CH, NO), €30 USA & Canada, €40 rest of world.
 * Also turns off the store-wide free-shipping threshold, which would otherwise
 * make the paid zones free, and adds a VAT rule for each new destination.
 * Safe to re-run: it only adds what's missing.
 *
 * Usage:
 *   npx tsx scripts/setup-shipping-zones.ts --dry-run
 *   npx tsx scripts/setup-shipping-zones.ts
 */
import { db } from "../src/lib/db";
import { defaultTaxRule, shippingZonePlan } from "./shipping-zones";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const plan = shippingZonePlan();
  const log = (msg: string) => console.log(`${dryRun ? "[dry-run] " : ""}${msg}`);

  const europeZone = await db.shippingZone.findFirst({
    where: { countries: { some: { country: "IT" } } },
    include: { countries: true },
  });
  if (!europeZone) {
    console.error(
      "No shipping zone contains IT — create the Europe zone in Admin > Shipping first."
    );
    process.exit(1);
  }

  const settings = await db.storeSettings.findFirst();
  const italianRule = await db.taxRule.findFirst({ where: { country: "IT", categoryId: null } });
  if (!italianRule) {
    console.error("No store-wide IT tax rule — EU destinations can't copy the Italian VAT rate.");
    process.exit(1);
  }

  await db.$transaction(
    async (tx) => {
      // A country may only be in one zone: take each planned country out of
      // any other zone before adding it to its own.
      const claim = async (zoneId: string, countries: string[]) => {
        const moved = await tx.shippingZoneCountry.findMany({
          where: { country: { in: countries }, zoneId: { not: zoneId } },
        });
        if (moved.length)
          log(`  moving from other zones: ${moved.map((m) => m.country).join(",")}`);
        if (!dryRun) {
          await tx.shippingZoneCountry.deleteMany({
            where: { country: { in: countries }, zoneId: { not: zoneId } },
          });
          await tx.shippingZoneCountry.createMany({
            data: countries.map((country) => ({ zoneId, country })),
            skipDuplicates: true,
          });
        }
      };

      const have = new Set(europeZone.countries.map((c) => c.country));
      const added = plan.europe.filter((c) => !have.has(c));
      log(`Zone "${europeZone.name}" (free): adding ${added.length}: ${added.join(",") || "-"}`);
      await claim(europeZone.id, plan.europe);

      for (const zonePlan of plan.paid) {
        const euros = (zonePlan.method.basePrice / 100).toFixed(2);
        let zone = await tx.shippingZone.findFirst({ where: { name: zonePlan.name } });
        log(
          `Zone "${zonePlan.name}" (€${euros}): ${zone ? "exists" : "creating"}, ${zonePlan.countries.length} countries`
        );
        if (!zone && !dryRun)
          zone = await tx.shippingZone.create({ data: { name: zonePlan.name } });

        let method = await tx.shippingMethod.findFirst({ where: { name: zonePlan.method.name } });
        if (method && method.basePrice !== zonePlan.method.basePrice) {
          log(
            `  method "${method.name}" costs €${(method.basePrice / 100).toFixed(2)}, setting €${euros}`
          );
          if (!dryRun) {
            method = await tx.shippingMethod.update({
              where: { id: method.id },
              data: { basePrice: zonePlan.method.basePrice, active: true },
            });
          }
        } else if (!method) {
          log(`  creating method "${zonePlan.method.name}" at €${euros}`);
          if (!dryRun) method = await tx.shippingMethod.create({ data: zonePlan.method });
        }

        if (zone && method) {
          await claim(zone.id, zonePlan.countries);
          if (!dryRun) {
            await tx.shippingZoneMethod.createMany({
              data: [{ zoneId: zone.id, methodId: method.id }],
              skipDuplicates: true,
            });
          }
        }
      }

      if (settings && settings.freeShippingThreshold !== null) {
        log(
          `Turning off the free-shipping threshold (was €${(settings.freeShippingThreshold / 100).toFixed(2)})`
        );
        if (!dryRun) {
          await tx.storeSettings.update({
            where: { id: settings.id },
            data: { freeShippingThreshold: null },
          });
        }
      }

      const destinations = [...plan.europe, ...plan.paid.flatMap((z) => z.countries)];
      const covered = new Set(
        (
          await tx.taxRule.findMany({
            where: { country: { in: destinations }, categoryId: null },
            select: { country: true },
          })
        ).map((r) => r.country)
      );
      const newRules = destinations
        .filter((c) => !covered.has(c))
        .map((c) => defaultTaxRule(c, italianRule.ratePercent));
      const euRules = newRules.filter((r) => r.ratePercent > 0);
      log(
        `Tax rules: adding ${newRules.length} (${euRules.length} EU at ${italianRule.ratePercent}%: ` +
          `${euRules.map((r) => r.country).join(",") || "-"}; ${newRules.length - euRules.length} exports at 0%)`
      );
      if (!dryRun) await tx.taxRule.createMany({ data: newRules });
    },
    { timeout: 60_000 }
  );

  log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
