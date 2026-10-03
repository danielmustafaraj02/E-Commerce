import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseBody, parseSources, parseTranslationIt } from "@/lib/journal/db-articles";
import { ArticleForm } from "../../article-form";
import { updateArticle, deleteArticle } from "../../actions";

export default async function EditArticlePage({ params }: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const [post, products] = await Promise.all([
    db.journalPost.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    db.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit article</h1>
      <ArticleForm
        action={updateArticle.bind(null, post.id)}
        deleteAction={deleteArticle.bind(null, post.id)}
        products={products}
        submitLabel="Save changes"
        initial={{
          title: post.title,
          slug: post.slug,
          category: post.category,
          seoTitle: post.seoTitle ?? "",
          description: post.description,
          intro: post.intro,
          heroUrl: post.heroUrl,
          heroAlt: post.heroAlt,
          published: post.published,
          body: parseBody(post.body),
          productIds: post.products.map((p) => p.id),
          sources: parseSources(post.sources),
          it: (() => {
            const it = parseTranslationIt(post.translationIt);
            return {
              title: it?.title ?? "",
              seoTitle: it?.seoTitle ?? "",
              description: it?.description ?? "",
              intro: it?.intro ?? "",
              heroAlt: it?.heroAlt ?? "",
              body: it?.body ?? [],
            };
          })(),
        }}
      />
    </div>
  );
}
