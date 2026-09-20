"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { missingChecklistItems, toTaskRows } from "@/lib/launch-checklist";

// Adds the launch checklist (see src/lib/launch-checklist.ts) to the roadmap.
// Admin-only, and additive: only checklist items that aren't already on the
// roadmap (same title) are created, so it's safe to click twice.
export async function importLaunchChecklist() {
  const session = await requireAdmin();

  const existing = await db.improvementTask.findMany({ select: { title: true } });
  const rows = toTaskRows(missingChecklistItems(existing.map((task) => task.title)));

  if (rows.length > 0) {
    await db.improvementTask.createMany({ data: rows });
    await writeAuditLog({
      userId: session!.user.id,
      action: "improvementTask.import",
      entityType: "ImprovementTask",
      after: { created: rows.length },
    });
  }

  redirect(`/admin/roadmap?imported=${rows.length}`);
}
