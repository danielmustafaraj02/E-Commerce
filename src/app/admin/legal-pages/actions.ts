"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(20000),
});

export async function updateLegalPage(slug: string, _prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const parsed = schema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const before = await db.legalPage.findUnique({ where: { slug } });

  const page = await db.legalPage.upsert({
    where: { slug },
    update: parsed.data,
    create: { slug, ...parsed.data },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "legal_page.update",
    entityType: "LegalPage",
    entityId: page.id,
    before,
    after: page,
  });

  redirect("/admin/legal-pages");
}
