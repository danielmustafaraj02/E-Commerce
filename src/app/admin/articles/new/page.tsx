import { db } from "@/lib/db";
import { ArticleForm } from "../article-form";
import { createArticle } from "../actions";

export default async function NewArticlePage({ searchParams }: PageProps<"/admin/articles/new">) {
  const { product } = await searchParams;
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-semibold">New article</h1>
      <ArticleForm
        action={createArticle}
        products={products}
        submitLabel="Create article"
        defaultProductIds={typeof product === "string" ? [product] : []}
      />
    </div>
  );
}
