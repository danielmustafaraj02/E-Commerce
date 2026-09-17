import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { deleteCustomer } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";

export default async function AdminCustomerDetailPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;

  const [session, settings, customer, wishlistItems] = await Promise.all([
    auth(),
    getStoreSettings(),
    db.user.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: "desc" } } },
    }),
    db.wishlistItem.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: { product: true },
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

      <h2 className="mt-8 mb-3 text-lg font-medium">Wishlist ({wishlistItems.length})</h2>
      {wishlistItems.length === 0 ? (
        <p className="text-foreground/70 text-sm">Nothing saved to their wishlist.</p>
      ) : (
        <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
          {wishlistItems.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <Link
                href={`/products/${item.product.slug}`}
                className="text-primary hover:underline"
              >
                {item.product.name}
              </Link>
              <span className="text-foreground/70">
                {formatMoney(item.product.price, item.product.currency, settings.defaultLocale)}
              </span>
              <span className="text-foreground/50">{item.createdAt.toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}

      {session?.user?.role === "admin" && customer.role === "customer" && (
        <div className="border-danger/30 mt-8 rounded border p-4">
          <h2 className="text-danger mb-1 text-sm font-semibold">Danger zone</h2>
          <p className="text-foreground/60 mb-3 text-xs">
            Permanently deletes this account (login, sessions, saved addresses, reviews,
            wishlist). Their past orders are kept for records, just detached from the account.
            Useful for cleaning up test accounts — cannot be undone.
          </p>
          <ConfirmForm
            action={deleteCustomer.bind(null, customer.id)}
            confirmMessage={`Delete the account for ${customer.email}? This cannot be undone.`}
          >
            <button type="submit" className="btn-danger text-sm">
              Delete account
            </button>
          </ConfirmForm>
        </div>
      )}
    </div>
  );
}
