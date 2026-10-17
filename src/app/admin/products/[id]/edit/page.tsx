import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "../../product-form";
import { loadPageMeta } from "@/lib/page-meta-admin";
import { MetaEditor } from "../../../seo/meta-editor";
import { setProductArticle } from "../../../articles/actions";
import { updateProduct, deactivateProduct, deleteProduct } from "../../actions";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;

  const [categories, suppliers, product, articles] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } }),
    db.journalPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        published: true,
        products: { where: { id }, select: { id: true } },
      },
    }),
  ]);

  if (!product) notFound();

  const metaKey = `product:${product.slug}`;
  const meta = await loadPageMeta([metaKey]);
  const boundUpdate = updateProduct.bind(null, product.id);
  const boundDeactivate = deactivateProduct.bind(null, product.id);
  const boundDelete = deleteProduct.bind(null, product.id);
  const linkedArticles = articles.filter((a) => a.products.length > 0);
  const otherArticles = articles.filter((a) => a.products.length === 0);
  const linkArticle = setProductArticle.bind(null, product.id, "link");
  const unlinkArticle = setProductArticle.bind(null, product.id, "unlink");

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
          nameNl: product.nameNl,
          namePl: product.namePl,
          nameCs: product.nameCs,
          nameSv: product.nameSv,
          nameRo: product.nameRo,
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
          descriptionNl: product.descriptionNl,
          descriptionPl: product.descriptionPl,
          descriptionCs: product.descriptionCs,
          descriptionSv: product.descriptionSv,
          descriptionRo: product.descriptionRo,
          story: product.story,
          storyEn: product.storyEn,
          storyNl: product.storyNl,
          storyPl: product.storyPl,
          storyCs: product.storyCs,
          storySv: product.storySv,
          storyRo: product.storyRo,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          sku: product.sku,
          stockQty: product.stockQty,
          lowStockThreshold: product.lowStockThreshold,
          categoryId: product.categoryId,
          active: product.active,
          unlisted: product.unlisted,
          featuredInCarousel: product.featuredInCarousel,
          pageLayout: product.pageLayout,
          imageUrls: product.images
            .map((image) => (image.isLifestyle ? `${image.url} lifestyle` : image.url))
            .join("\n"),
          trackInventory: product.trackInventory,
          supplierId: product.supplierId,
          supplierSku: product.supplierSku,
          costPrice: product.costPrice,
          giftStyles: product.giftStyles,
          giftOccasions: product.giftOccasions,
          giftRecipients: product.giftRecipients,
        }}
      />

      <section className="border-foreground/10 mt-8 flex flex-col gap-3 border-t pt-6">
        <h2 className="text-lg font-semibold">Search appearance</h2>
        <p className="text-foreground/60 text-sm">
          The title and description Google and social networks show for this page, per language.
        </p>
        <MetaEditor metaKey={metaKey} initial={meta[metaKey] ?? {}} />
      </section>

      <section className="border-foreground/10 mt-8 flex flex-col gap-3 border-t pt-6">
        <h2 className="text-lg font-semibold">Articles</h2>
        <p className="text-foreground/60 text-sm">
          Linked journal articles appear on this product&apos;s page.
        </p>
        {linkedArticles.length > 0 && (
          <ul className="divide-foreground/10 border-foreground/10 divide-y rounded border">
            {linkedArticles.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <Link href={`/admin/articles/${a.id}/edit`} className="underline">
                  {a.title}
                </Link>
                {!a.published && <span className="text-foreground/50 text-xs">Draft</span>}
                <form action={unlinkArticle} className="ml-auto">
                  <input type="hidden" name="articleId" value={a.id} />
                  <button type="submit" className="text-xs text-red-700 underline">
                    Unlink
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {otherArticles.length > 0 && (
            <form action={linkArticle} className="flex gap-2">
              <select name="articleId" required defaultValue="" className="field">
                <option value="" disabled>
                  Link an existing article…
                </option>
                {otherArticles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="border-foreground/20 rounded-(--radius-button) border px-4 py-2 text-sm"
              >
                Link
              </button>
            </form>
          )}
          <Link href={`/admin/articles/new?product=${product.id}`} className="btn-primary text-sm">
            Write a new article
          </Link>
        </div>
      </section>

      <div className="border-foreground/10 mt-8 flex gap-3 border-t pt-6">
        <form action={boundDeactivate}>
          <button
            type="submit"
            className="border-foreground/20 rounded-(--radius-button) border px-4 py-2 text-sm"
          >
            Deactivate
          </button>
        </form>
        <form action={boundDelete}>
          <button
            type="submit"
            className="border-danger/40 text-danger rounded-(--radius-button) border px-4 py-2 text-sm"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
