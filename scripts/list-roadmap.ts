/**
 * Read-only diagnostic: dumps every ImprovementTask row (Admin > Roadmap)
 * so it can be reviewed and trimmed down to the truly important ones,
 * rather than guessing from the static launch-checklist.ts source file
 * (which may be stale relative to what's actually been edited/completed
 * in the live admin UI since it was imported).
 *
 * Usage:
 *   npx tsx scripts/list-roadmap.ts
 */
import { db } from "../src/lib/db";

async function main() {
  const tasks = await db.improvementTask.findMany({
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "asc" }],
  });

  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  console.log(`${tasks.length} total task(s) — ${done.length} done, ${open.length} open.\n`);

  console.log(`=== OPEN (${open.length}) ===`);
  for (const t of open) {
    console.log(`[${t.priority}] ${t.title}${t.description ? ` — ${t.description}` : ""}`);
  }

  console.log(`\n=== DONE (${done.length}) ===`);
  for (const t of done) {
    console.log(`[${t.priority}] ${t.title}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
