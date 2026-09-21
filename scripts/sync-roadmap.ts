/**
 * Pushes any new items from src/lib/launch-checklist.ts onto the live
 * Admin > Roadmap — the same additive logic as clicking "Import checklist"
 * in the admin UI (src/app/admin/roadmap/import-actions.ts), just runnable
 * without an admin browser session. Matches by exact title, so existing
 * tasks (including ones staff have edited, ticked off, or deleted) are
 * never touched. Safe to re-run any time the checklist changes.
 *
 * No secrets involved — safe to commit/re-run.
 *
 * Usage:
 *   npx tsx scripts/sync-roadmap.ts
 */
import { db } from "../src/lib/db";
import { missingChecklistItems, toTaskRows } from "../src/lib/launch-checklist";

async function main() {
  const existing = await db.improvementTask.findMany({ select: { title: true } });
  const missing = missingChecklistItems(existing.map((t) => t.title));

  if (missing.length === 0) {
    console.log("Roadmap already has every checklist item — nothing to add.");
    return;
  }

  const rows = toTaskRows(missing);
  await db.improvementTask.createMany({ data: rows });

  console.log(`Added ${rows.length} task(s):`);
  for (const row of rows) {
    console.log(`  [${row.priority}] ${row.status === "done" ? "✅" : "○"} ${row.title}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
