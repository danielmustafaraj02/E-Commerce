import { db } from "@/lib/db";
import { CategoryForm } from "../category-form";
import { createCategory } from "../actions";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New category</h1>
      <CategoryForm action={createCategory} categories={categories} submitLabel="Create category" />
    </div>
  );
}
