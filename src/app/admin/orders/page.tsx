import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import type { Prisma } from "@prisma/client";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAGE_SIZE = 50;

const PAYMENT_LABELS: Record<string, string> = {
  stripe: "Card / wallet",
  paypal: "PayPal",
  bank_transfer: "Bank transfer",
  cash_on_delivery: "Cash on delivery",
};

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status, q, page: pageParam } = await searchParams;
  const statusFilter = typeof status === "string" && STATUSES.includes(status) ? status : undefined;
  const query = typeof q === "string" ? q.trim() : "";
  // Floored: a non-integer page (?page=3.7, a stray decimal from hand-edited
  // URLs) would otherwise reach Prisma's `skip` and throw at request time.
  const page = Math.max(1, Math.floor(Number(typeof pageParam === "string" ? pageParam : 1) || 1));

  // Preserve status + search across pagination/filter links without hand-building query strings everywhere.
  const linkParams = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (query) params.set("q", query);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const where: Prisma.OrderWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { guestEmail: { contains: query, mode: "insensitive" } },
            { user: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [settings, totalCount, orders] = await Promise.all([
    getStoreSettings(),
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: true,
        payments: { orderBy: { createdAt: "desc" }, take: 1, select: { provider: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Orders</h1>

      <form className="mb-4 flex max-w-sm gap-2">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by order number or email"
          className="field"
          aria-label="Search orders by order number or email"
        />
        <button type="submit" className="btn-primary text-sm whitespace-nowrap">
          Search
        </button>
        {query && (
          <Link
            href={linkParams({ q: undefined })}
            className="text-foreground/60 self-center text-sm whitespace-nowrap hover:underline"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link
          href={linkParams({ status: undefined, page: undefined })}
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
            href={linkParams({ status: s, page: undefined })}
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
                <th className="py-3 pr-4 font-medium">Payment</th>
                <th className="py-3 pr-4 font-medium">Items</th>
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
                  <td className="text-foreground/70 py-3 pr-4">
                    {order.payments[0] ? (PAYMENT_LABELS[order.payments[0].provider] ?? order.payments[0].provider) : "—"}
                  </td>
                  <td className="text-foreground/70 py-3 pr-4">{order._count.items}</td>
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
          <p className="text-foreground/70 px-4 py-8 text-center text-sm">
            {page > 1 ? (
              <>
                Page {page} is past the last result.{" "}
                <Link href={linkParams({ page: undefined })} className="text-primary hover:underline">
                  Back to page 1
                </Link>
              </>
            ) : query || statusFilter ? (
              <>
                No orders match this filter.{" "}
                <Link href="/admin/orders" className="text-primary hover:underline">
                  Clear filters
                </Link>
              </>
            ) : (
              "No orders found."
            )}
          </p>
        )}
      </div>

      {totalCount > 0 && (
        <div className="text-foreground/60 mt-4 flex items-center justify-between text-sm">
          <p>
            Page {page} of {totalPages} &middot; {totalCount} order{totalCount === 1 ? "" : "s"}
          </p>
          <div className="flex gap-3">
            {page > 1 && (
              <Link href={linkParams({ page: String(page - 1) })} className="hover:underline">
                &larr; Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={linkParams({ page: String(page + 1) })} className="hover:underline">
                Next &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
