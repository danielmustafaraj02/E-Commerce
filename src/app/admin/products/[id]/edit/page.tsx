import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "../../product-form";
import { updateProduct, deactivateProduct, deleteProduct } from "../../actions";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;

  const [categories, suppliers, product] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);
  const boundDeactivate = deactivateProduct.bind(null, product.id);
  const boundDelete = deleteProduct.bind(null, product.id);

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit product</h1>
      <ProductForm
        action={boundUpdate}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Save changes"
        initial={{
          name: product.name,
          nameEn: product.nameEn,
          nameFr: product.nameFr,
          nameDe: product.nameDe,
          nameAr: product.nameAr,
          nameZh: product.nameZh,
          nameRu: product.nameRu,
          nameEs: product.nameEs,
          namePt: product.namePt,
          nameHi: product.nameHi,
          nameJa: product.nameJa,
          slug: product.slug,
          description: product.description,
          descriptionEn: product.descriptionEn,
          descriptionFr: product.descriptionFr,
          descriptionDe: product.descriptionDe,
          descriptionAr: product.descriptionAr,
          descriptionZh: product.descriptionZh,
          descriptionRu: product.descriptionRu,
          descriptionEs: product.descriptionEs,
          descriptionPt: product.descriptionPt,
          descriptionHi: product.descriptionHi,
          descriptionJa: product.descriptionJa,
          price: product.price,
          sku: product.sku,
          stockQty: product.stockQty,
          lowStockThreshold: product.lowStockThreshold,
          categoryId: product.categoryId,
          active: product.active,
          imageUrls: product.images.map((image) => image.url).join("\n"),
          trackInventory: product.trackInventory,
          supplierId: product.supplierId,
          supplierSku: product.supplierSku,
          costPrice: product.costPrice,
        }}
      />

      <div className="border-foreground/10 mt-8 flex gap-3 border-t pt-6">
        <form action={boundDeactivate}>
          <button type="submit" className="border-foreground/20 rounded border px-4 py-2 text-sm">
            Deactivate
          </button>
        </form>
        <form action={boundDelete}>
          <button
            type="submit"
            className="border-danger/40 text-danger rounded border px-4 py-2 text-sm"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
