"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function createSupplier(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    website: formData.get("website") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supplier = await db.supplier.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "supplier.create",
    entityType: "Supplier",
    entityId: supplier.id,
    after: supplier,
  });

  redirect("/admin/suppliers");
}

export async function updateSupplier(supplierId: string, _prevState: unknown, formData: FormData) {
  const session = await requireStaff();

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    website: formData.get("website") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const before = await db.supplier.findUnique({ where: { id: supplierId } });
  if (!before) return { error: "Supplier not found" };

  const supplier = await db.supplier.update({
    where: { id: supplierId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "supplier.update",
    entityType: "Supplier",
    entityId: supplier.id,
    before,
    after: supplier,
  });

  redirect("/admin/suppliers");
}

export async function toggleSupplier(supplierId: string) {
  const session = await requireStaff();
  const supplier = await db.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return;

  const updated = await db.supplier.update({
    where: { id: supplierId },
    data: { active: !supplier.active },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "supplier.toggle",
    entityType: "Supplier",
    entityId: supplierId,
    before: { active: supplier.active },
    after: { active: updated.active },
  });

  redirect("/admin/suppliers");
}
