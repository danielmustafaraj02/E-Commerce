"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const categorySchema = z.object({
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  parentId: z.string().min(1).optional(),
});

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn") || undefined,
    slug: formData.get("slug"),
    parentId: formData.get("parentId") || undefined,
  });
}

export async function createCategory(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "A category with that slug already exists" };

  const category = await db.category.create({
    data: {
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      slug: parsed.data.slug,
      parentId: parsed.data.parentId || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "category.create",
    entityType: "Category",
    entityId: category.id,
    after: category,
  });

  redirect("/admin/categories");
}

export async function updateCategory(categoryId: string, _prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (parsed.data.parentId === categoryId) {
    return { error: "A category cannot be its own parent" };
  }

  const existing = await db.category.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: categoryId } },
  });
  if (existing) return { error: "A category with that slug already exists" };

  const before = await db.category.findUnique({ where: { id: categoryId } });
  if (!before) return { error: "Category not found" };

  const category = await db.category.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      slug: parsed.data.slug,
      parentId: parsed.data.parentId || null,
    },
  });

  await writeAuditLog({
    userId: session!.user.id,
    action: "category.update",
    entityType: "Category",
    entityId: category.id,
    before,
    after: category,
  });

  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const session = await requireStaff();

  const [productCount, childCount] = await Promise.all([
    db.product.count({ where: { categoryId } }),
    db.category.count({ where: { parentId: categoryId } }),
  ]);
  if (productCount > 0 || childCount > 0) {
    redirect("/admin/categories?error=in-use");
  }

  const before = await db.category.findUnique({ where: { id: categoryId } });
  if (!before) redirect("/admin/categories");

  await db.category.delete({ where: { id: categoryId } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "category.delete",
    entityType: "Category",
    entityId: categoryId,
    before,
  });

  redirect("/admin/categories");
}
