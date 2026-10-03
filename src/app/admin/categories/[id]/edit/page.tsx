import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "../../category-form";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await params;
  const [category, categories, coverCandidates] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({ where: { NOT: { id } }, orderBy: { name: "asc" } }),
    // Only this category's own products, and only those with a photo — a
    // product without one cannot act as a cover image.
    db.product.findMany({
      where: { categoryId: id, images: { some: {} } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);
  if (!category) notFound();

  const boundUpdate = updateCategory.bind(null, category.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit category</h1>
      <CategoryForm
        action={boundUpdate}
        categories={categories}
        coverProducts={coverCandidates.map((product) => ({
          id: product.id,
          name: product.name,
          imageUrl: product.images[0]!.url,
        }))}
        submitLabel="Save changes"
        initial={{
          name: category.name,
          nameEn: category.nameEn,
          nameFr: category.nameFr,
          nameDe: category.nameDe,
          nameAr: category.nameAr,
          nameZh: category.nameZh,
          nameRu: category.nameRu,
          nameEs: category.nameEs,
          namePt: category.namePt,
          nameHi: category.nameHi,
          nameJa: category.nameJa,
          description: category.description,
          descriptionEn: category.descriptionEn,
          descriptionFr: category.descriptionFr,
          descriptionDe: category.descriptionDe,
          descriptionAr: category.descriptionAr,
          descriptionZh: category.descriptionZh,
          descriptionRu: category.descriptionRu,
          descriptionEs: category.descriptionEs,
          descriptionPt: category.descriptionPt,
          descriptionHi: category.descriptionHi,
          descriptionJa: category.descriptionJa,
          slug: category.slug,
          parentId: category.parentId,
          coverProductId: category.coverProductId,
        }}
      />
    </div>
  );
}
