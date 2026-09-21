/**
 * Trims Admin > Roadmap down to exactly the curated top-10 launch-critical
 * items (see scripts/add-top10-priorities.ts) by deleting everything else.
 * Creates any of the 10 that are still missing first. Always shows what
 * would be deleted and asks for confirmation before deleting anything,
 * unless --yes is passed.
 *
 * This is destructive — anything staff added by hand that isn't one of the
 * 10 titles below gets deleted too. Review the printed list carefully.
 *
 * Usage:
 *   npx tsx scripts/keep-only-top10.ts          # shows what would be deleted, asks to confirm
 *   npx tsx scripts/keep-only-top10.ts --yes     # skips the prompt, deletes immediately
 */
import { createInterface } from "node:readline/promises";
import { db } from "../src/lib/db";
import { TOP_10 } from "./top10-data";

async function main() {
  const autoYes = process.argv.includes("--yes");

  const existing = await db.improvementTask.findMany();
  const keepTitles = new Set(TOP_10.map((t) => t.title));

  const toCreate = TOP_10.filter((t) => !existing.some((e) => e.title === t.title));
  const toDelete = existing.filter((e) => !keepTitles.has(e.title));
  const toKeep = existing.filter((e) => keepTitles.has(e.title));

  console.log(`Currently on the roadmap: ${existing.length} task(s).`);
  console.log(`Already matching the top 10: ${toKeep.length}.`);
  console.log(`Missing from the top 10 (will be created): ${toCreate.length}.`);
  console.log(`\nWould DELETE ${toDelete.length} task(s):`);
  for (const t of toDelete) {
    console.log(`  ${t.status === "done" ? "✅" : "○"} ${t.title}`);
  }

  if (toDelete.length === 0 && toCreate.length === 0) {
    console.log("\nAlready exactly the top 10 — nothing to do.");
    return;
  }

  if (!autoYes) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `\nDelete these ${toDelete.length} task(s) and keep only the top 10? [y/N] `
    );
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Aborted — nothing changed.");
      return;
    }
  }

  if (toCreate.length > 0) {
    const now = Date.now();
    await db.improvementTask.createMany({
      data: toCreate.map((t, i) => ({
        title: t.title,
        description: t.description,
        priority: "high" as const,
        status: "open",
        createdAt: new Date(now - i * 1000),
      })),
    });
  }
  if (toDelete.length > 0) {
    await db.improvementTask.deleteMany({ where: { id: { in: toDelete.map((t) => t.id) } } });
  }

  console.log(`\nDone. Roadmap now has exactly the top 10.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
