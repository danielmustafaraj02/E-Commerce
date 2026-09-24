"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { missingChecklistItems, toTaskRows } from "@/lib/launch-checklist";
import { missingTranslationTasks, translationTaskRows } from "@/lib/translation-tasks";

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

// Adds one translation task per storefront language (src/lib/translation-tasks.ts),
// each carrying the prompt the coding agent runs. Admin-only and additive, like
// the checklist import.
export async function importTranslationTasks() {
  const session = await requireAdmin();

  const existing = await db.improvementTask.findMany({ select: { title: true } });
  const rows = translationTaskRows(missingTranslationTasks(existing.map((task) => task.title)));

  if (rows.length > 0) {
    await db.improvementTask.createMany({ data: rows });
    await writeAuditLog({
      userId: session!.user.id,
      action: "improvementTask.importTranslations",
      entityType: "ImprovementTask",
      after: { created: rows.length },
    });
  }

  redirect(`/admin/roadmap?translations=${rows.length}`);
}
