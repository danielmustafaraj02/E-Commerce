/**
 * Replaces Admin > Roadmap (ImprovementTask) with just the 5 most
 * important open items, in place of the full launch-checklist import
 * (99 rows: 35 done, 64 open) that was cluttering it.
 *
 * Usage:
 *   npx tsx scripts/trim-roadmap.ts --dry-run
 *   npx tsx scripts/trim-roadmap.ts
 */
import { db } from "../src/lib/db";

const KEEP = [
  {
    title: "Set real stock levels",
    description:
      "All 45 products are Out of stock, so nothing can currently be bought and search results say 'out of stock'.",
  },
  {
    title: "Fix VAT: add tax rules for every country you ship to, or restrict shipping",
    description:
      "Only Italy had a tax rule when last checked, while the site says prices include VAT. Check Admin > Tax rules.",
  },
  {
    title: "Test PayPal end to end",
    description:
      "Approve and capture a payment, and also an approval that is never captured (the order must stay pending). Stripe has already been verified with a real charge; PayPal hasn't.",
  },
  {
    title: "Point an uptime monitor at /api/health",
    description: "UptimeRobot, Better Stack or similar, with alerts to your phone.",
  },
  {
    title: "Confirm database backups and test a restore",
    description: "Neon point-in-time restore — a backup you have never restored isn't a backup.",
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const existing = await db.improvementTask.count();

  console.log(`Currently ${existing} task(s) on the roadmap.`);
  console.log(`\nWill replace with these ${KEEP.length}:\n`);
  for (const task of KEEP) console.log(`- ${task.title}`);

  if (dryRun) {
    console.log("\n[dry-run] No changes made.");
    return;
  }

  await db.$transaction([
    db.improvementTask.deleteMany({}),
    db.improvementTask.createMany({
      data: KEEP.map((task) => ({ ...task, priority: "high", status: "open" })),
    }),
  ]);

  console.log(`\nDone. Roadmap now has ${KEEP.length} task(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
