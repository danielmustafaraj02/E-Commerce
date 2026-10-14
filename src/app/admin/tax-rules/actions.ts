"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const taxRuleSchema = z.object({
  name: z.string().min(1).max(200),
  country: z
    .string()
    .length(2)
    .regex(/^[A-Za-z]{2}$/, "Country must be an ISO 3166-1 alpha-2 code, e.g. IT")
    .transform((v) => v.toUpperCase()),
  region: z.string().max(100).optional(),
  ratePercent: z.coerce.number().min(0).max(100),
  categoryId: z.string().min(1).optional(),
});

function parseForm(formData: FormData) {
  return taxRuleSchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country"),
    region: formData.get("region") || undefined,
    ratePercent: formData.get("ratePercent"),
    categoryId: formData.get("categoryId") || undefined,
  });
}

export async function createTaxRule(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const rule = await db.taxRule.create({
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      region: parsed.data.region || null,
      ratePercent: parsed.data.ratePercent,
      categoryId: parsed.data.categoryId || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "taxRule.create",
    entityType: "TaxRule",
    entityId: rule.id,
    after: rule,
  });

  redirect("/admin/tax-rules");
}

export async function updateTaxRule(ruleId: string, _prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const before = await db.taxRule.findUnique({ where: { id: ruleId } });
  if (!before) return { error: "Tax rule not found" };

  const rule = await db.taxRule.update({
    where: { id: ruleId },
    data: {
      name: parsed.data.name,
      country: parsed.data.country,
      region: parsed.data.region || null,
      ratePercent: parsed.data.ratePercent,
      categoryId: parsed.data.categoryId || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "taxRule.update",
    entityType: "TaxRule",
    entityId: rule.id,
    before,
    after: rule,
  });

  redirect("/admin/tax-rules");
}

export async function deleteTaxRule(ruleId: string) {
  const session = await requireStaff();
  const before = await db.taxRule.findUnique({ where: { id: ruleId } });
  if (!before) redirect("/admin/tax-rules");

  await db.taxRule.delete({ where: { id: ruleId } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "taxRule.delete",
    entityType: "TaxRule",
    entityId: ruleId,
    before,
  });

  redirect("/admin/tax-rules");
}
