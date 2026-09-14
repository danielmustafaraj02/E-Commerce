import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";

const REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export default async function AdminDashboardPage() {
  const settings = await getStoreSettings();

  const [productCount, orderCount, userCount, revenue, topItems, recentOrders, dropshipItems] =
    await Promise.all([
      db.product.count(),
      db.order.count(),
      db.user.count({ where: { role: "customer" } }),
      db.order.aggregate({
        where: { status: { in: REVENUE_STATUSES } },
        _sum: { total: true },
      }),
      db.orderItem.groupBy({
        by: ["productId", "productName"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { orderNumber: true, status: true, total: true, currency: true, createdAt: true },
      }),
      // Profit is only knowable for dropshipped items — costPrice/unitCost
      // isn't tracked for in-house stock, so this is deliberately labeled
      // "dropship profit", not overall store profit.
      db.orderItem.findMany({
        where: { unitCost: { not: null }, order: { status: { in: REVENUE_STATUSES } } },
        select: { unitPrice: true, unitCost: true, quantity: true },
      }),
    ]);

  const dropshipProfit = dropshipItems.reduce(
    (sum, item) => sum + (item.unitPrice - (item.unitCost ?? 0)) * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-foreground/10 rounded border p-4">
          <dt className="text-foreground/70 text-sm">Revenue</dt>
          <dd className="text-2xl font-semibold">
            {formatMoney(revenue._sum.total ?? 0, settings.defaultCurrency, settings.defaultLocale)}
          </dd>
        </div>
        <div className="border-foreground/10 rounded border p-4">
          <dt className="text-foreground/70 text-sm">Orders</dt>
          <dd className="text-2xl font-semibold">{orderCount}</dd>
        </div>
        <div className="border-foreground/10 rounded border p-4">
          <dt className="text-foreground/70 text-sm">Products</dt>
          <dd className="text-2xl font-semibold">{productCount}</dd>
        </div>
        <div className="border-foreground/10 rounded border p-4">
          <dt className="text-foreground/70 text-sm">Customers</dt>
          <dd className="text-2xl font-semibold">{userCount}</dd>
        </div>
        {dropshipItems.length > 0 && (
          <div className="border-foreground/10 rounded border p-4">
            <dt className="text-foreground/70 text-sm">Dropship profit</dt>
            <dd className="text-2xl font-semibold">
              {formatMoney(dropshipProfit, settings.defaultCurrency, settings.defaultLocale)}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-medium">Top products</h2>
          {topItems.length === 0 ? (
            <p className="text-foreground/70 text-sm">No sales yet.</p>
          ) : (
            <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
              {topItems.map((item) => (
                <li key={item.productId} className="flex justify-between py-2">
                  <span>{item.productName}</span>
                  <span className="text-foreground/70">{item._sum.quantity} sold</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium">Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-foreground/70 text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
              {recentOrders.map((order) => (
                <li key={order.orderNumber} className="flex justify-between py-2">
                  <Link href={`/admin/orders/${order.orderNumber}`} className="hover:text-primary">
                    {order.orderNumber}
                  </Link>
                  <span className="text-foreground/70">{order.status}</span>
                  <span>{formatMoney(order.total, order.currency, settings.defaultLocale)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
