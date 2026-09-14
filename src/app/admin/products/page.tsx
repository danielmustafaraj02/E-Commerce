import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminProductsPage() {
  const [settings, products] = await Promise.all([
    getStoreSettings(),
    db.product.findMany({ orderBy: { createdAt: "desc" }, include: { supplier: true } }),
  ]);

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
                  <td className="py-3 pr-4 pl-4 font-medium">{product.name}</td>
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
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">No products yet.</p>
        )}
      </div>
    </div>
  );
}
