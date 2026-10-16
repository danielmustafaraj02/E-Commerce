import { ARTICLES } from "@/lib/journal";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseBody, parseSources, parseTranslationIt } from "@/lib/journal/db-articles";
import { ArticleForm, type TranslationDraft } from "../../article-form";
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

  const translations: Record<string, TranslationDraft> = {};
  const draft = (c: {
    title: string;
    seoTitle?: string | null;
    description: string;
    intro: string;
    heroAlt?: string | null;
    body: unknown;
  }): TranslationDraft => ({
    title: c.title,
    seoTitle: c.seoTitle ?? "",
    description: c.description,
    intro: c.intro,
    heroAlt: c.heroAlt ?? "",
    body: parseBody(c.body),
  });
  const it = parseTranslationIt(post.translationIt);
  if (it) translations.it = draft(it);
  try {
    for (const row of await db.journalPostTranslation.findMany({ where: { postId: post.id } })) {
      translations[row.locale] = draft(row);
    }
  } catch {
    // Table not migrated yet: the other languages simply start empty.
  }

  return (
    <div className="max-w-5xl">
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
          publishedOn: (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10),
          overridesBuiltIn: ARTICLES.some((a) => a.slug === post.slug),
          body: parseBody(post.body),
          productIds: post.products.map((p) => p.id),
          sources: parseSources(post.sources),
          translations,
        }}
      />
    </div>
  );
}
