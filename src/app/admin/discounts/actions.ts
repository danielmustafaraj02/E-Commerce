"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const discountSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((s) => s.toUpperCase()),
    percentOff: z.coerce.number().min(0).max(100).optional(),
    amountOff: z.coerce.number().nonnegative().optional(),
    expiresAt: z.string().optional(),
    maxUses: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.percentOff || data.amountOff, {
    message: "Set either a percent-off or amount-off value",
  });

export async function createDiscountCode(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();

  const parsed = discountSchema.safeParse({
    code: formData.get("code"),
    percentOff: formData.get("percentOff") || undefined,
    amountOff: formData.get("amountOff") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    maxUses: formData.get("maxUses") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { code, percentOff, expiresAt, maxUses } = parsed.data;
  const amountOff =
    parsed.data.amountOff !== undefined ? Math.round(parsed.data.amountOff * 100) : undefined;

  let discount;
  try {
    discount = await db.discountCode.create({
      data: {
        code,
        percentOff,
        amountOff,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        maxUses,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That code already exists" };
    }
    throw error;
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "discount.create",
    entityType: "DiscountCode",
    entityId: discount.id,
    after: discount,
  });

  redirect("/admin/discounts");
}

export async function toggleDiscountCode(id: string) {
  const session = await requireStaff();
  const discount = await db.discountCode.findUnique({ where: { id } });
  if (!discount) return;

  const updated = await db.discountCode.update({
    where: { id },
    data: { active: !discount.active },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "discount.toggle",
    entityType: "DiscountCode",
    entityId: id,
    before: { active: discount.active },
    after: { active: updated.active },
  });

  redirect("/admin/discounts");
}
