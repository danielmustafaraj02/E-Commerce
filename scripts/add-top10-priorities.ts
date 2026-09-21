/**
 * Adds a curated top-10 to Admin > Roadmap — not the full 104-item
 * launch checklist (see src/lib/launch-checklist.ts and sync-roadmap.ts
 * for that), just the highest-impact items for selling securely: account
 * security, payment correctness, abuse protection, and email reliability.
 * Matches by exact title, so re-running is safe and won't duplicate.
 *
 * No secrets involved — safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/add-top10-priorities.ts
 */
import { db } from "../src/lib/db";
import { TOP_10 } from "./top10-data";

async function main() {
  const existing = await db.improvementTask.findMany({ select: { title: true } });
  const have = new Set(existing.map((t) => t.title));
  const missing = TOP_10.filter((t) => !have.has(t.title));

  if (missing.length === 0) {
    console.log("All 10 are already on the roadmap — nothing to add.");
    return;
  }

  const now = Date.now();
  await db.improvementTask.createMany({
    data: missing.map((t, i) => ({
      title: t.title,
      description: t.description,
      priority: "high" as const,
      status: "open",
      createdAt: new Date(now - i * 1000),
    })),
  });

  console.log(`Added ${missing.length} task(s):`);
  for (const t of missing) console.log(`  ○ ${t.title}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
