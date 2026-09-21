"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const schema = z.object({
  stripeSecretKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  klarnaEnabled: z.coerce.boolean(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  paypalWebhookId: z.string().optional(),
});

export async function updatePaymentSettings(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    stripeSecretKey: formData.get("stripeSecretKey"),
    stripePublishableKey: formData.get("stripePublishableKey"),
    stripeWebhookSecret: formData.get("stripeWebhookSecret"),
    klarnaEnabled: formData.get("klarnaEnabled") === "on",
    paypalClientId: formData.get("paypalClientId"),
    paypalClientSecret: formData.get("paypalClientSecret"),
    paypalWebhookId: formData.get("paypalWebhookId"),
  });
  if (!parsed.success) return { error: "Invalid input", success: false };
  const { klarnaEnabled, ...secretFields } = parsed.data;

  // Fields left blank mean "no change" — the form never echoes existing
  // secrets back into the inputs, so a blank field isn't "clear this key".
  // klarnaEnabled is a checkbox, not a secret, so it's always written as-is
  // (an unchecked box really does mean "off").
  const data: Record<string, string | boolean> = { klarnaEnabled };
  for (const [key, value] of Object.entries(secretFields)) {
    const trimmed = value?.trim();
    if (trimmed) data[key] = trimmed;
  }

  const before = await getStoreSettings();
  const updated = await db.storeSettings.upsert({
    where: { id: before.id },
    update: data,
    create: { id: before.id, ...data },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "settings.payments_update",
    entityType: "StoreSettings",
    entityId: updated.id,
    before: { klarnaEnabled: before.klarnaEnabled },
    // Never write actual secret values into the audit log — only which
    // fields changed.
    after: { updatedFields: Object.keys(data), klarnaEnabled },
  });

  return { error: null, success: true };
}

const offlineSchema = z.object({
  bankTransferEnabled: z.coerce.boolean(),
  bankAccountHolder: z.string().optional(),
  bankIban: z.string().optional(),
  bankBic: z.string().optional(),
});

// Separate from updatePaymentSettings — these are plain settings (booleans,
// bank details), not secrets, so "blank means no change" doesn't apply here:
// an unchecked box really does mean disabled.
export async function updateOfflinePaymentSettings(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const parsed = offlineSchema.safeParse({
    bankTransferEnabled: formData.get("bankTransferEnabled") === "on",
    bankAccountHolder: formData.get("bankAccountHolder") || undefined,
    bankIban: formData.get("bankIban") || undefined,
    bankBic: formData.get("bankBic") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input", success: false };

  const before = await getStoreSettings();
  const updated = await db.storeSettings.upsert({
    where: { id: before.id },
    update: {
      bankTransferEnabled: parsed.data.bankTransferEnabled,
      bankAccountHolder: parsed.data.bankAccountHolder || null,
      bankIban: parsed.data.bankIban || null,
      bankBic: parsed.data.bankBic || null,
    },
    create: {
      id: before.id,
      bankTransferEnabled: parsed.data.bankTransferEnabled,
      bankAccountHolder: parsed.data.bankAccountHolder || null,
      bankIban: parsed.data.bankIban || null,
      bankBic: parsed.data.bankBic || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "settings.offline_payments_update",
    entityType: "StoreSettings",
    entityId: updated.id,
    after: {
      bankTransferEnabled: updated.bankTransferEnabled,
    },
  });

  return { error: null, success: true };
}

export async function clearPaymentField(field: keyof typeof schema.shape) {
  const session = await requireAdmin();
  const before = await getStoreSettings();

  await db.storeSettings.update({ where: { id: before.id }, data: { [field]: null } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "settings.payments_clear",
    entityType: "StoreSettings",
    entityId: before.id,
    after: { clearedField: field },
  });
}
