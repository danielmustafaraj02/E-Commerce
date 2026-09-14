import { db } from "@/lib/db";

// Every admin mutation should call this — it's both a security control and
// the thing you'll want the day something goes wrong (§11.2).
export async function writeAuditLog(input: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}) {
  await db.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeData: input.before !== undefined ? JSON.stringify(input.before) : undefined,
      afterData: input.after !== undefined ? JSON.stringify(input.after) : undefined,
    },
  });
}
