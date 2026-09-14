"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
});

export async function createImprovementTask(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const task = await db.improvementTask.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
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
