import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";

export default async function AdminCustomerDetailPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;

  const [settings, customer] = await Promise.all([
    getStoreSettings(),
    db.user.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: "desc" } } },
    }),
  ]);

  if (!customer) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">{customer.name ?? customer.email}</h1>
      <p className="text-foreground/70 mb-6 text-sm">
        {customer.email} &middot; Joined {customer.createdAt.toLocaleDateString()}
      </p>

      <h2 className="mb-3 text-lg font-medium">Orders</h2>
      {customer.orders.length === 0 ? (
        <p className="text-foreground/70 text-sm">No orders yet.</p>
      ) : (
        <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
          {customer.orders.map((order) => (
            <li key={order.id} className="flex justify-between py-2">
              <Link
                href={`/admin/orders/${order.orderNumber}`}
                className="text-primary hover:underline"
              >
                {order.orderNumber}
              </Link>
              <span className="text-foreground/70">{order.status}</span>
              <span>{formatMoney(order.total, order.currency, settings.defaultLocale)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
