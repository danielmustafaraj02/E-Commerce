import { db } from "@/lib/db";
import { ProductForm } from "../product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">New product</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Create product"
      />
    </div>
  );
}
