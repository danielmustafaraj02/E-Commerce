"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  description: z.string().min(1).max(5000),
  descriptionEn: z.string().max(5000).optional(),
  price: z.coerce.number().nonnegative(),
  sku: z.string().min(1).max(100),
  stockQty: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1).optional(),
  active: z.coerce.boolean(),
  imageUrls: z.string().optional(),
  // Dropshipping
  trackInventory: z.coerce.boolean(),
  supplierId: z.string().min(1).optional(),
  supplierSku: z.string().max(100).optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
});

function parseImageUrls(raw: string | undefined) {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn") || undefined,
    slug: formData.get("slug"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn") || undefined,
    price: formData.get("price"),
    sku: formData.get("sku"),
    stockQty: formData.get("stockQty"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    categoryId: formData.get("categoryId") || undefined,
    active: formData.get("active") === "on",
    imageUrls: formData.get("imageUrls") || undefined,
    trackInventory: formData.get("trackInventory") === "on",
    supplierId: formData.get("supplierId") || undefined,
    supplierSku: formData.get("supplierSku") || undefined,
    costPrice: formData.get("costPrice") || undefined,
  });
}

export async function createProduct(_prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { imageUrls, price, costPrice, ...fields } = parsed.data;
  const images = parseImageUrls(imageUrls);

  let product;
  try {
    product = await db.product.create({
      data: {
        ...fields,
        price: Math.round(price * 100),
        costPrice: costPrice !== undefined ? Math.round(costPrice * 100) : undefined,
        images: {
          create: images.map((url, position) => ({ url, altText: fields.name, position })),
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That slug or SKU is already in use" };
    }
    throw error;
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "product.create",
    entityType: "Product",
    entityId: product.id,
    after: product,
  });

  redirect("/admin/products");
}

export async function updateProduct(productId: string, _prevState: unknown, formData: FormData) {
  const session = await requireStaff();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { imageUrls, price, costPrice, supplierId, supplierSku, nameEn, descriptionEn, ...fields } =
    parsed.data;
  const images = parseImageUrls(imageUrls);

  const before = await db.product.findUnique({ where: { id: productId } });
  if (!before) return { error: "Product not found" };

  let product;
  try {
    product = await db.product.update({
      where: { id: productId },
      data: {
        ...fields,
        price: Math.round(price * 100),
        // Explicit null (not undefined) so clearing these in the edit form
        // actually clears them — Prisma's `update` skips undefined fields.
        costPrice: costPrice !== undefined ? Math.round(costPrice * 100) : null,
        supplierId: supplierId ?? null,
        supplierSku: supplierSku ?? null,
        nameEn: nameEn ?? null,
        descriptionEn: descriptionEn ?? null,
        images: {
          deleteMany: {},
          create: images.map((url, position) => ({ url, altText: fields.name, position })),
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That slug or SKU is already in use" };
    }
    throw error;
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "product.update",
    entityType: "Product",
    entityId: product.id,
    before,
    after: product,
  });

  redirect("/admin/products");
}

export async function deactivateProduct(productId: string) {
  const session = await requireStaff();
  const product = await db.product.update({ where: { id: productId }, data: { active: false } });

  await writeAuditLog({
    userId: session!.user.id,
    action: "product.deactivate",
    entityType: "Product",
    entityId: product.id,
  });

  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const session = await requireAdmin();

  try {
    await db.product.delete({ where: { id: productId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      // Referenced by past orders — deactivate instead of losing order history.
      await deactivateProduct(productId);
      return;
    }
    throw error;
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "product.delete",
    entityType: "Product",
    entityId: productId,
  });

  redirect("/admin/products");
}
