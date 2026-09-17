import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { updateOrderStatus, deleteOrder } from "../actions";
import { sendToSupplier, updateFulfillment } from "./fulfillment-actions";
import { StatusForm } from "./status-form";
import { FulfillmentTrackingForm } from "./fulfillment-tracking-form";
import { ConfirmForm } from "@/components/confirm-form";

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[orderNumber]">) {
  const { orderNumber } = await params;

  const [session, settings, order] = await Promise.all([
    auth(),
    getStoreSettings(),
    db.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        address: true,
        shippingMethod: true,
        payments: true,
        user: true,
        fulfillments: { include: { supplier: true, items: true }, orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  if (!order) notFound();

  const boundUpdate = updateOrderStatus.bind(null, order.orderNumber);

  // Items with a supplier but not yet grouped into a Fulfillment — grouped
  // by supplier so "Send to supplier" fires once per supplier, not per item.
  const pendingItems = order.items.filter((item) => item.supplierId && !item.fulfillmentId);
  const pendingSupplierIds = [...new Set(pendingItems.map((item) => item.supplierId!))];
  const pendingSuppliers = pendingSupplierIds.length
    ? await db.supplier.findMany({ where: { id: { in: pendingSupplierIds } } })
    : [];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold">Order {order.orderNumber}</h1>
      <p className="text-foreground/70 mb-6 text-sm">
        Placed {order.createdAt.toLocaleString()} by{" "}
        {order.user?.email ?? order.guestEmail ?? "guest"}
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-medium">Items</h2>
          <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.productName} &times; {item.quantity}
                  {item.supplierId && (
                    <span className="bg-foreground/10 text-foreground/60 ml-2 rounded px-1.5 py-0.5 text-xs">
                      dropship
                    </span>
                  )}
                </span>
                <span>
                  {formatMoney(
                    item.unitPrice * item.quantity,
                    order.currency,
                    settings.defaultLocale
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-foreground/10 mt-4 flex flex-col gap-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal, order.currency, settings.defaultLocale)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {formatMoney(order.shippingAmount, order.currency, settings.defaultLocale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatMoney(order.taxAmount, order.currency, settings.defaultLocale)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>
                  -{formatMoney(order.discountAmount, order.currency, settings.defaultLocale)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.total, order.currency, settings.defaultLocale)}</span>
            </div>
          </div>

          {order.address && (
            <div className="text-foreground/70 mt-6 text-sm">
              <h3 className="text-foreground mb-1 font-medium">Shipping to</h3>
              <p>{order.address.fullName}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.postalCode} {order.address.country}
              </p>
            </div>
          )}

          <div className="text-foreground/70 mt-6 text-sm">
            <h3 className="text-foreground mb-1 font-medium">Payments</h3>
            {order.payments.length === 0 ? (
              <p>No payment attempts yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {order.payments.map((payment) => (
                  <li key={payment.id}>
                    {payment.provider} — {payment.status} —{" "}
                    {formatMoney(payment.amount, payment.currency, settings.defaultLocale)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 text-lg font-medium">Order status</h2>
            <StatusForm
              action={boundUpdate}
              currentStatus={order.status}
              currentTracking={order.trackingNumber}
              isAdmin={session?.user?.role === "admin"}
            />
          </div>

          {(pendingSuppliers.length > 0 || order.fulfillments.length > 0) && (
            <div>
              <h2 className="mb-3 text-lg font-medium">Supplier fulfillment</h2>
              <div className="flex flex-col gap-4">
                {pendingSuppliers.map((supplier) => {
                  const items = pendingItems.filter((item) => item.supplierId === supplier.id);
                  const boundSend = sendToSupplier.bind(null, order.orderNumber, supplier.id);
                  return (
                    <div
                      key={supplier.id}
                      className="border-foreground/10 rounded border p-3 text-sm"
                    >
                      <p className="mb-2 font-medium">{supplier.name}</p>
                      <ul className="text-foreground/70 mb-3">
                        {items.map((item) => (
                          <li key={item.id}>
                            {item.quantity} &times; {item.productName}
                          </li>
                        ))}
                      </ul>
                      <form action={boundSend}>
                        <button type="submit" className="btn-primary text-sm">
                          Send to supplier
                        </button>
                      </form>
                    </div>
                  );
                })}

                {order.fulfillments.map((fulfillment) => {
                  const boundTracking = updateFulfillment.bind(
                    null,
                    order.orderNumber,
                    fulfillment.id
                  );
                  return (
                    <div
                      key={fulfillment.id}
                      className="border-foreground/10 rounded border p-3 text-sm"
                    >
                      <p className="mb-2 font-medium">
                        {fulfillment.supplier.name}{" "}
                        <span className="text-foreground/60 font-normal">
                          — sent {fulfillment.sentAt?.toLocaleDateString()}
                        </span>
                      </p>
                      <ul className="text-foreground/70 mb-3">
                        {fulfillment.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity} &times; {item.productName}
                          </li>
                        ))}
                      </ul>
                      <FulfillmentTrackingForm
                        action={boundTracking}
                        currentStatus={fulfillment.status}
                        currentTracking={fulfillment.trackingNumber}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {session?.user?.role === "admin" && (
            <div className="border-danger/30 rounded border p-4">
              <h2 className="text-danger mb-1 text-sm font-semibold">Danger zone</h2>
              <p className="text-foreground/60 mb-3 text-xs">
                Permanently deletes this order and its payment records. Useful for cleaning up
                test orders — cannot be undone.
              </p>
              <ConfirmForm
                action={deleteOrder.bind(null, order.id)}
                confirmMessage={`Delete order ${order.orderNumber}? This cannot be undone.`}
              >
                <button type="submit" className="btn-danger text-sm">
                  Delete order
                </button>
              </ConfirmForm>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
