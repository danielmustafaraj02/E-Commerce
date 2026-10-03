import { Link } from "@/components/localized-link";
import { db } from "@/lib/db";
import { ARTICLES } from "@/lib/journal";
import { StatusBadge } from "@/components/status-badge";

// Admin > Catalog > Articles: the journal. Articles written here are editable;
// the in-code ones (sourced long reads) are listed for reference.
export default async function AdminArticlesPage() {
  const posts = await db.journalPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-primary rounded-(--radius-button) px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          New article
        </Link>
      </div>

      <h2 className="mb-2 text-sm font-semibold">Your articles</h2>
      {posts.length === 0 ? (
        <p className="border-foreground/10 text-foreground/70 mb-8 rounded-lg border border-dashed p-6 text-sm">
          No articles yet. Write one and link it to the products it features, it will appear in the
          journal and on those product pages.
        </p>
      ) : (
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-3 pr-4 pl-4">Title</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Products</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Updated</th>
                <th className="py-3 pr-4" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="py-3 pr-4 pl-4 font-medium">{post.title}</td>
                  <td className="py-3 pr-4 capitalize">{post.category}</td>
                  <td className="py-3 pr-4">{post._count.products}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={post.published ? "published" : "draft"} />
                  </td>
                  <td className="py-3 pr-4">{post.updatedAt.toLocaleDateString("en-GB")}</td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">
                    {post.published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-accent-deep mr-4 hover:underline"
                      >
                        View
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${post.id}/edit`}
                      className="text-accent-deep hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-1 text-sm font-semibold">Built-in articles ({ARTICLES.length})</h2>
      <p className="text-foreground/60 mb-2 text-xs">
        Long-form, sourced pieces maintained in the code (src/content/journal). They show in the
        journal next to yours and on the product pages of the pieces they feature.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="py-3 pr-4 pl-4">Title</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Published</th>
              <th className="py-3 pr-4" />
            </tr>
          </thead>
          <tbody>
            {ARTICLES.map((article) => (
              <tr key={article.slug}>
                <td className="py-3 pr-4 pl-4">{article.title}</td>
                <td className="py-3 pr-4 capitalize">{article.category}</td>
                <td className="py-3 pr-4">{article.published}</td>
                <td className="py-3 pr-4 text-right">
                  <Link href={`/blog/${article.slug}`} className="text-accent-deep hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
