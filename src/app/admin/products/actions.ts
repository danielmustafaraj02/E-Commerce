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
  nameFr: z.string().max(200).optional(),
  nameDe: z.string().max(200).optional(),
  nameAr: z.string().max(200).optional(),
  nameZh: z.string().max(200).optional(),
  nameRu: z.string().max(200).optional(),
  nameEs: z.string().max(200).optional(),
  namePt: z.string().max(200).optional(),
  nameHi: z.string().max(200).optional(),
  nameJa: z.string().max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  description: z.string().min(1).max(5000),
  descriptionEn: z.string().max(5000).optional(),
  descriptionFr: z.string().max(5000).optional(),
  descriptionDe: z.string().max(5000).optional(),
  descriptionAr: z.string().max(5000).optional(),
  descriptionZh: z.string().max(5000).optional(),
  descriptionRu: z.string().max(5000).optional(),
  descriptionEs: z.string().max(5000).optional(),
  descriptionPt: z.string().max(5000).optional(),
  descriptionHi: z.string().max(5000).optional(),
  descriptionJa: z.string().max(5000).optional(),
  story: z.string().max(2000).optional(),
  storyEn: z.string().max(2000).optional(),
  price: z.coerce.number().nonnegative(),
  // Display-only "was" price for the homepage Special Selection — never
  // charged. Optional; the section only shows a product once this is set
  // higher than price.
  compareAtPrice: z.coerce.number().nonnegative().optional(),
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

// Each line is a URL, optionally followed by whitespace and the literal
// marker "lifestyle" for on-model photos that should skip the catalog's
// white-background blend treatment (see ProductImage.isLifestyle).
function parseImageUrls(raw: string | undefined) {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, marker] = line.split(/\s+/);
      return { url, isLifestyle: marker?.toLowerCase() === "lifestyle" };
    });
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn") || undefined,
    nameFr: formData.get("nameFr") || undefined,
    nameDe: formData.get("nameDe") || undefined,
    nameAr: formData.get("nameAr") || undefined,
    nameZh: formData.get("nameZh") || undefined,
    nameRu: formData.get("nameRu") || undefined,
    nameEs: formData.get("nameEs") || undefined,
    namePt: formData.get("namePt") || undefined,
    nameHi: formData.get("nameHi") || undefined,
    nameJa: formData.get("nameJa") || undefined,
    slug: formData.get("slug"),
    description: formData.get("description"),
    descriptionEn: formData.get("descriptionEn") || undefined,
    descriptionFr: formData.get("descriptionFr") || undefined,
    descriptionDe: formData.get("descriptionDe") || undefined,
    descriptionAr: formData.get("descriptionAr") || undefined,
    descriptionZh: formData.get("descriptionZh") || undefined,
    descriptionRu: formData.get("descriptionRu") || undefined,
    descriptionEs: formData.get("descriptionEs") || undefined,
    descriptionPt: formData.get("descriptionPt") || undefined,
    descriptionHi: formData.get("descriptionHi") || undefined,
    descriptionJa: formData.get("descriptionJa") || undefined,
    story: formData.get("story") || undefined,
    storyEn: formData.get("storyEn") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
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
  const { imageUrls, price, compareAtPrice, costPrice, ...fields } = parsed.data;
  const images = parseImageUrls(imageUrls);

  let product;
  try {
    product = await db.product.create({
      data: {
        ...fields,
        price: Math.round(price * 100),
        compareAtPrice: compareAtPrice !== undefined ? Math.round(compareAtPrice * 100) : undefined,
        costPrice: costPrice !== undefined ? Math.round(costPrice * 100) : undefined,
        images: {
          create: images.map((img, position) => ({
            url: img.url,
            altText: fields.name,
            position,
            isLifestyle: img.isLifestyle,
          })),
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
  const {
    imageUrls,
    price,
    compareAtPrice,
    costPrice,
    supplierId,
    supplierSku,
    nameEn,
    nameFr,
    nameDe,
    nameAr,
    nameZh,
    nameRu,
    nameEs,
    namePt,
    nameHi,
    nameJa,
    descriptionEn,
    descriptionFr,
    descriptionDe,
    descriptionAr,
    descriptionZh,
    descriptionRu,
    descriptionEs,
    descriptionPt,
    descriptionHi,
    descriptionJa,
    story,
    storyEn,
    ...fields
  } = parsed.data;
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
        compareAtPrice: compareAtPrice !== undefined ? Math.round(compareAtPrice * 100) : null,
        costPrice: costPrice !== undefined ? Math.round(costPrice * 100) : null,
        supplierId: supplierId ?? null,
        supplierSku: supplierSku ?? null,
        nameEn: nameEn ?? null,
        nameFr: nameFr ?? null,
        nameDe: nameDe ?? null,
        nameAr: nameAr ?? null,
        nameZh: nameZh ?? null,
        nameRu: nameRu ?? null,
        nameEs: nameEs ?? null,
        namePt: namePt ?? null,
        nameHi: nameHi ?? null,
        nameJa: nameJa ?? null,
        descriptionEn: descriptionEn ?? null,
        descriptionFr: descriptionFr ?? null,
        descriptionDe: descriptionDe ?? null,
        descriptionAr: descriptionAr ?? null,
        descriptionZh: descriptionZh ?? null,
        descriptionRu: descriptionRu ?? null,
        descriptionEs: descriptionEs ?? null,
        descriptionPt: descriptionPt ?? null,
        descriptionHi: descriptionHi ?? null,
        descriptionJa: descriptionJa ?? null,
        story: story ?? "",
        storyEn: storyEn ?? null,
        images: {
          deleteMany: {},
          create: images.map((img, position) => ({
            url: img.url,
            altText: fields.name,
            position,
            isLifestyle: img.isLifestyle,
          })),
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
