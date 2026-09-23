"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { TASK_DETAILS_MAX } from "@/lib/roadmap-claude";

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(TASK_DETAILS_MAX).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  forClaude: z.boolean(),
});

export async function createImprovementTask(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    priority: formData.get("priority"),
    forClaude: formData.get("forClaude") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const task = await db.improvementTask.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      forClaude: parsed.data.forClaude,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "improvementTask.create",
    entityType: "ImprovementTask",
    entityId: task.id,
    after: task,
  });

  redirect("/admin/roadmap");
}

export async function toggleImprovementTask(id: string) {
  const session = await requireStaff();
  const task = await db.improvementTask.findUnique({ where: { id } });
  if (!task) return;

  const nowDone = task.status !== "done";
  const updated = await db.improvementTask.update({
    where: { id },
    data: { status: nowDone ? "done" : "open", completedAt: nowDone ? new Date() : null },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "improvementTask.toggle",
    entityType: "ImprovementTask",
    entityId: id,
    before: { status: task.status },
    after: { status: updated.status },
  });

  redirect("/admin/roadmap");
}

export async function deleteImprovementTask(id: string) {
  const session = await requireStaff();
  const task = await db.improvementTask.findUnique({ where: { id } });
  if (!task) return;

  await db.improvementTask.delete({ where: { id } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "improvementTask.delete",
    entityType: "ImprovementTask",
    entityId: id,
    before: task,
  });

  redirect("/admin/roadmap");
}

// Flags/unflags a task for the nightly Claude routine. Unflagging also drops a
// pending claim, so re-flagging later makes it immediately claimable again.
export async function toggleClaudeTask(id: string) {
  const session = await requireStaff();
  const task = await db.improvementTask.findUnique({ where: { id } });
  if (!task) return;

  const updated = await db.improvementTask.update({
    where: { id },
    data: task.forClaude ? { forClaude: false, claudeClaimedAt: null } : { forClaude: true },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "improvementTask.toggleClaude",
    entityType: "ImprovementTask",
    entityId: id,
    before: { forClaude: task.forClaude },
    after: { forClaude: updated.forClaude },
  });

  redirect("/admin/roadmap");
}

// Clears Claude's report (and claim) so the next nightly run picks the task
// up again — for when the PR wasn't right. The previous report and the
// owner's feedback are appended to the details so that run sees both.
export async function askClaudeAgain(id: string, formData: FormData) {
  const session = await requireStaff();
  const task = await db.improvementTask.findUnique({ where: { id } });
  if (!task) return;

  const feedback = String(formData.get("feedback") ?? "")
    .trim()
    .slice(0, TASK_DETAILS_MAX);
  const history = [
    task.claudeReport && `--- Previous attempt (Claude's report) ---\n${task.claudeReport}`,
    feedback && `--- Owner feedback for the next attempt ---\n${feedback}`,
  ].filter(Boolean);
  const description = [task.description, ...history].filter(Boolean).join("\n\n") || null;

  await db.improvementTask.update({
    where: { id },
    data: {
      description,
      forClaude: true,
      status: "open",
      completedAt: null,
      claudeClaimedAt: null,
      claudeReport: null,
      claudeReportAt: null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "improvementTask.askClaudeAgain",
    entityType: "ImprovementTask",
    entityId: id,
    before: { description: task.description, claudeReport: task.claudeReport },
    after: { description },
  });

  redirect("/admin/roadmap");
}
