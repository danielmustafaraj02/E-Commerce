"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const schema = z.object({
  resendApiKey: z.string().optional(),
  emailFrom: z.string().optional(),
  turnstileSiteKey: z.string().optional(),
  turnstileSecretKey: z.string().optional(),
  upstashRedisUrl: z.string().optional(),
  upstashRedisToken: z.string().optional(),
  googleClientId: z.string().optional(),
  googleClientSecret: z.string().optional(),
});

// emailFrom, turnstileSiteKey, and googleClientId aren't secrets — the form
// shows their current value, so blank genuinely means "clear this". The
// actual secret fields never get echoed back, so blank there means "no
// change" instead (matches the Payments page's pattern).
const NOT_SECRET = new Set(["emailFrom", "turnstileSiteKey", "googleClientId"]);

export async function updateIntegrationSettings(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    resendApiKey: formData.get("resendApiKey"),
    emailFrom: formData.get("emailFrom"),
    turnstileSiteKey: formData.get("turnstileSiteKey"),
    turnstileSecretKey: formData.get("turnstileSecretKey"),
    upstashRedisUrl: formData.get("upstashRedisUrl"),
    upstashRedisToken: formData.get("upstashRedisToken"),
    googleClientId: formData.get("googleClientId"),
    googleClientSecret: formData.get("googleClientSecret"),
  });
  if (!parsed.success) return { error: "Invalid input", success: false };

  const data: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    const trimmed = value?.trim() ?? "";
    if (NOT_SECRET.has(key)) {
      data[key] = trimmed || null;
    } else if (trimmed) {
      data[key] = trimmed;
    }
  }

  const before = await getStoreSettings();
  const updated = await db.storeSettings.upsert({
    where: { id: before.id },
    update: data,
    create: { id: before.id, ...data },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "settings.integrations_update",
    entityType: "StoreSettings",
    entityId: updated.id,
    after: { updatedFields: Object.keys(data) },
  });

  return { error: null, success: true };
}

export async function clearIntegrationField(field: keyof typeof schema.shape) {
  const session = await requireAdmin();
  const before = await getStoreSettings();

  await db.storeSettings.update({ where: { id: before.id }, data: { [field]: null } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "settings.integrations_clear",
    entityType: "StoreSettings",
    entityId: before.id,
    after: { clearedField: field },
  });
}
