"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { LOOK_SIZE } from "@/lib/looks";

const lookSchema = z.object({
  name: z.string().trim().min(1).max(200),
  imageUrl: z
    .string()
    .trim()
    .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Image URL must start with https://")
    .optional(),
  discountPercent: z.coerce
    .number()
    .int()
    .min(1, "Discount must be between 1% and 50%")
    .max(50, "Discount must be between 1% and 50%"),
  active: z.coerce.boolean(),
  productIds: z
    .array(z.string().min(1))
    .refine(
      (ids) => ids.length === LOOK_SIZE && new Set(ids).size === LOOK_SIZE,
      "Choose three different pieces (necklace, bracelet and earrings)"
    ),
});

async function parseForm(formData: FormData) {
  const parsed = lookSchema.safeParse({
    name: formData.get("name"),
    imageUrl: formData.get("imageUrl") || undefined,
    discountPercent: formData.get("discountPercent"),
    active: formData.get("active") === "on",
    productIds: formData.getAll("productIds").filter((v) => v !== ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const found = await db.product.count({ where: { id: { in: parsed.data.productIds } } });
  if (found !== LOOK_SIZE) return { error: "One of the chosen pieces no longer exists" };
  return { data: parsed.data };
}

const lookFields = (data: z.infer<typeof lookSchema>) => ({
  name: data.name,
  imageUrl: data.imageUrl ?? null,
  discountPercent: data.discountPercent,
  active: data.active,
});

export async function createLook(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = await parseForm(formData);
  if (!parsed.data) return { error: parsed.error };
  const { productIds } = parsed.data;

  // A piece belongs to one look, so choosing it here moves it from any other.
  const look = await db.$transaction(async (tx) => {
    const created = await tx.look.create({ data: lookFields(parsed.data) });
    await tx.product.updateMany({
      where: { id: { in: productIds } },
      data: { lookId: created.id },
    });
    return created;
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "look.create",
    entityType: "Look",
    entityId: look.id,
    after: { ...look, productIds },
  });
  redirect("/admin/looks");
}

export async function updateLook(lookId: string, _prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = await parseForm(formData);
  if (!parsed.data) return { error: parsed.error };
  const { productIds } = parsed.data;

  const before = await db.look.findUnique({ where: { id: lookId } });
  if (!before) return { error: "Look not found" };

  await db.$transaction(async (tx) => {
    await tx.look.update({ where: { id: lookId }, data: lookFields(parsed.data) });
    await tx.product.updateMany({
      where: { lookId, id: { notIn: productIds } },
      data: { lookId: null },
    });
    await tx.product.updateMany({ where: { id: { in: productIds } }, data: { lookId } });
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "look.update",
    entityType: "Look",
    entityId: lookId,
    before,
    after: { ...lookFields(parsed.data), productIds },
  });
  redirect("/admin/looks");
}

export async function deleteLook(lookId: string) {
  const session = await requireStaff();
  const before = await db.look.findUnique({ where: { id: lookId } });
  if (!before) redirect("/admin/looks");

  // Product.lookId is ON DELETE SET NULL, so the pieces stay, just unlinked.
  await db.look.delete({ where: { id: lookId } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "look.delete",
    entityType: "Look",
    entityId: lookId,
    before,
  });
  redirect("/admin/looks");
}
