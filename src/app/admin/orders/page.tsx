import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status } = await searchParams;
  const statusFilter = typeof status === "string" && STATUSES.includes(status) ? status : undefined;

  const [settings, orders] = await Promise.all([
    getStoreSettings(),
    db.order.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Orders</h1>

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 transition-colors ${
            !statusFilter
              ? "bg-primary text-white"
              : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 capitalize transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="border-foreground/10 bg-surface overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-foreground/10 text-foreground/60 border-b">
                <th className="py-3 pr-4 pl-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-foreground/5 hover:bg-foreground/[0.02] border-b transition-colors last:border-b-0"
                >
                  <td className="py-3 pr-4 pl-4">
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{order.user?.email ?? order.guestEmail ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4 font-medium">
                    {formatMoney(order.total, order.currency, settings.defaultLocale)}
                  </td>
                  <td className="text-foreground/70 py-3 pr-4">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">No orders found.</p>
        )}
      </div>
    </div>
  );
}
