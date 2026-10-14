"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const methodSchema = z.object({
  name: z.string().min(1).max(200),
  basePrice: z.coerce.number().nonnegative(),
  pricePerKg: z.coerce.number().nonnegative(),
  estimatedDaysMin: z.coerce.number().int().positive(),
  estimatedDaysMax: z.coerce.number().int().positive(),
  active: z.coerce.boolean(),
});

function parseForm(formData: FormData) {
  return methodSchema.safeParse({
    name: formData.get("name"),
    basePrice: formData.get("basePrice"),
    pricePerKg: formData.get("pricePerKg"),
    estimatedDaysMin: formData.get("estimatedDaysMin"),
    estimatedDaysMax: formData.get("estimatedDaysMax"),
    active: formData.get("active") === "on",
  });
}

export async function createShippingMethod(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (parsed.data.estimatedDaysMin > parsed.data.estimatedDaysMax) {
    return { error: "Minimum days can't be greater than maximum days" };
  }

  const method = await db.shippingMethod.create({
    data: {
      name: parsed.data.name,
      basePrice: Math.round(parsed.data.basePrice * 100),
      pricePerKg: Math.round(parsed.data.pricePerKg * 100),
      estimatedDaysMin: parsed.data.estimatedDaysMin,
      estimatedDaysMax: parsed.data.estimatedDaysMax,
      active: parsed.data.active,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "shippingMethod.create",
    entityType: "ShippingMethod",
    entityId: method.id,
    after: method,
  });

  redirect("/admin/shipping/methods");
}

export async function updateShippingMethod(
  methodId: string,
  _prevState: unknown,
  formData: FormData
) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (parsed.data.estimatedDaysMin > parsed.data.estimatedDaysMax) {
    return { error: "Minimum days can't be greater than maximum days" };
  }

  const before = await db.shippingMethod.findUnique({ where: { id: methodId } });
  if (!before) return { error: "Shipping method not found" };

  const method = await db.shippingMethod.update({
    where: { id: methodId },
    data: {
      name: parsed.data.name,
      basePrice: Math.round(parsed.data.basePrice * 100),
      pricePerKg: Math.round(parsed.data.pricePerKg * 100),
      estimatedDaysMin: parsed.data.estimatedDaysMin,
      estimatedDaysMax: parsed.data.estimatedDaysMax,
      active: parsed.data.active,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "shippingMethod.update",
    entityType: "ShippingMethod",
    entityId: method.id,
    before,
    after: method,
  });

  redirect("/admin/shipping/methods");
}

export async function toggleShippingMethod(methodId: string) {
  const session = await requireStaff();
  const method = await db.shippingMethod.findUnique({ where: { id: methodId } });
  if (!method) return;

  const updated = await db.shippingMethod.update({
    where: { id: methodId },
    data: { active: !method.active },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "shippingMethod.toggle",
    entityType: "ShippingMethod",
    entityId: methodId,
    before: { active: method.active },
    after: { active: updated.active },
  });

  redirect("/admin/shipping/methods");
}
