import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { deleteCategory } from "./actions";
import { FormAlert } from "@/components/form-alert";

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  const { error } = await searchParams;
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { parent: true, _count: { select: { products: true, children: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary text-sm">
          New category
        </Link>
      </div>

      {error === "in-use" && (
        <div className="mb-4">
          <FormAlert type="error">
            Can&apos;t delete a category that still has products or subcategories assigned to it.
          </FormAlert>
        </div>
      )}

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Slug</th>
                <th className="py-3 pr-4 font-medium">Parent</th>
                <th className="py-3 pr-4 font-medium">Products</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const boundDelete = deleteCategory.bind(null, category.id);
                return (
                  <tr
                    key={category.id}
                    className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                  >
                    <td className="py-3 pr-4 pl-4 font-medium">{category.name}</td>
                    <td className="text-foreground/70 py-3 pr-4">{category.slug}</td>
                    <td className="text-foreground/70 py-3 pr-4">
                      {category.parent?.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4">{category._count.products}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={boundDelete}>
                          <button type="submit" className="text-danger hover:underline">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
