import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { CatalogImage } from "@/components/catalog-image";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { q, page: pageParam } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  // Floored: a non-integer page (?page=3.7, a stray decimal from hand-edited
  // URLs) would otherwise reach Prisma's `skip` and throw at request time.
  const page = Math.max(1, Math.floor(Number(typeof pageParam === "string" ? pageParam : 1) || 1));

  const where: Prisma.ProductWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [settings, totalCount, products] = await Promise.all([
    getStoreSettings(),
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        supplier: true,
        // Only the first picture, for the thumbnail beside the name.
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          New product
        </Link>
      </div>

      <form className="mb-5 flex max-w-sm gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name or SKU"
          className="field"
          aria-label="Search products by name or SKU"
        />
        <button type="submit" className="btn-primary text-sm whitespace-nowrap">
          Search
        </button>
        {query && (
          <Link
            href="/admin/products"
            className="text-foreground/60 self-center text-sm whitespace-nowrap hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">SKU</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Stock</th>
                <th className="py-3 pr-4 font-medium">Sourcing</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                >
                  <td className="py-2 pr-4 pl-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <CatalogImage
                          src={product.images[0].url}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
                          className="border-foreground/10 size-10 shrink-0 rounded border object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="border-foreground/10 bg-foreground/5 size-10 shrink-0 rounded border"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="text-foreground/70 py-3 pr-4">{product.sku}</td>
                  <td className="py-3 pr-4">
                    {formatMoney(product.price, product.currency, settings.defaultLocale)}
                  </td>
                  <td className="py-3 pr-4">
                    {product.trackInventory ? (
                      <>
                        {product.stockQty}
                        {product.stockQty <= product.lowStockThreshold && (
                          <span className="text-warning ml-1 text-xs font-medium">low</span>
                        )}
                      </>
                    ) : product.stockQty > 0 ? (
                      <span className="text-foreground/50">Available</span>
                    ) : (
                      <span className="text-danger font-medium">Out of stock</span>
                    )}
                  </td>
                  <td className="text-foreground/70 py-3 pr-4">
                    {product.supplier ? `Dropship: ${product.supplier.name}` : "In-house"}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={product.active ? "active" : "inactive"} />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">
            {page > 1 ? (
              <>
                Page {page} is past the last result.{" "}
                <Link href={buildHref({ page: undefined })} className="text-primary hover:underline">
                  Back to page 1
                </Link>
              </>
            ) : query ? (
              <>
                No products match &ldquo;{query}&rdquo;.{" "}
                <Link href="/admin/products" className="text-primary hover:underline">
                  Clear search
                </Link>
              </>
            ) : (
              "No products yet."
            )}
          </p>
        )}
      </div>

      {totalCount > 0 && (
        <div className="text-foreground/60 mt-4 flex items-center justify-between text-sm">
          <p>
            Page {page} of {totalPages} &middot; {totalCount} product{totalCount === 1 ? "" : "s"}
          </p>
          <div className="flex gap-3">
            {page > 1 && (
              <Link href={buildHref({ page: String(page - 1) })} className="hover:underline">
                &larr; Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildHref({ page: String(page + 1) })} className="hover:underline">
                Next &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
