import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";

const REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered"];
const NOTIFICATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export default async function AdminDashboardPage() {
  const settings = await getStoreSettings();
  const since = new Date(Date.now() - NOTIFICATION_WINDOW_MS);

  const [
    productCount,
    orderCount,
    userCount,
    revenue,
    topItems,
    recentOrders,
    dropshipItems,
    newOrders,
    newCustomers,
  ] = await Promise.all([
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
    // Feeds the "Recent activity" notice below — a rolling 24h window rather
    // than a dismissible per-admin "seen" marker, see admin/layout.tsx.
    db.order.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { orderNumber: true, total: true, currency: true, createdAt: true },
    }),
    db.user.findMany({
      where: { role: "customer", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, name: true, createdAt: true },
    }),
  ]);

  const dropshipProfit = dropshipItems.reduce(
    (sum, item) => sum + (item.unitPrice - (item.unitCost ?? 0)) * item.quantity,
    0
  );

  const hasRecentActivity = newOrders.length > 0 || newCustomers.length > 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      {hasRecentActivity && (
        <div className="border-primary/20 bg-primary/5 mb-6 rounded-lg border p-4">
          <h2 className="mb-3 text-sm font-semibold">
            Recent activity (last 24h)
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {newOrders.map((order) => (
              <li key={order.orderNumber} className="flex items-center justify-between gap-3">
                <span>
                  New order{" "}
                  <Link href={`/admin/orders/${order.orderNumber}`} className="text-primary hover:underline">
                    {order.orderNumber}
                  </Link>
                </span>
                <span className="text-foreground/70">
                  {formatMoney(order.total, order.currency, settings.defaultLocale)}
                </span>
              </li>
            ))}
            {newCustomers.map((customer) => (
              <li key={customer.id} className="flex items-center justify-between gap-3">
                <span>
                  New account{" "}
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-primary hover:underline"
                  >
                    {customer.name || customer.email}
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
