import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm } from "../../category-form";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({ where: { NOT: { id } }, orderBy: { name: "asc" } }),
  ]);
  if (!category) notFound();

  const boundUpdate = updateCategory.bind(null, category.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit category</h1>
      <CategoryForm
        action={boundUpdate}
        categories={categories}
        submitLabel="Save changes"
        initial={{ name: category.name, slug: category.slug, parentId: category.parentId }}
      />
    </div>
  );
}
