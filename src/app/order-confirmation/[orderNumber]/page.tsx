import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { canAccessOrder } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { PaymentButtons } from "@/components/payment-buttons";
import { ReturnRequestForm } from "./return-request-form";

const RETURNABLE_STATUSES = ["paid", "processing", "shipped", "delivered"];

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps<"/order-confirmation/[orderNumber]">) {
  const { orderNumber } = await params;
  const { cancelled } = await searchParams;

  // A guest order's orderNumber is its only access token (see
  // lib/orders.ts) — rate-limit lookups per IP so it can't be brute-forced
  // via this page the way every other sensitive endpoint already is.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = await rateLimit(`order-lookup:${ip}`, 30, 60_000);
  if (!withinLimit) notFound();

  const [session, settings, uiLocale, order] = await Promise.all([
    auth(),
    getStoreSettings(),
    getLocale(),
    db.order.findUnique({
      where: { orderNumber },
      include: { items: true, shippingMethod: true, address: true, returnRequests: true },
    }),
  ]);
  const dict = getDictionary(uiLocale);

  if (!order) notFound();
  if (!canAccessOrder(order, session)) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">
        {order.status === "pending"
          ? dict.orderConfirmation.almostThere
          : dict.orderConfirmation.thankYou}
      </h1>
      <p className="text-foreground/70 text-sm">
        {order.status === "pending"
          ? dict.orderConfirmation.awaitingPayment(order.orderNumber)
          : dict.orderConfirmation.paymentReceived(order.orderNumber)}
      </p>
      {cancelled && <p className="text-warning mt-2 text-sm">{dict.orderConfirmation.cancelled}</p>}

      {order.status === "pending" && (
        <section className="mt-6">
          <PaymentButtons
            orderNumber={order.orderNumber}
            bankTransferEnabled={settings.bankTransferEnabled && Boolean(settings.bankIban)}
            codEnabled={settings.codEnabled}
            locale={settings.defaultLocale}
          />
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium">{dict.orderConfirmation.items}</h2>
        <ul className="divide-foreground/10 flex flex-col divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span>
                {item.productName} &times; {item.quantity}
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
      </section>

      <section className="border-foreground/10 mt-6 flex flex-col gap-1 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span>{dict.checkout.subtotal}</span>
          <span>{formatMoney(order.subtotal, order.currency, settings.defaultLocale)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="text-success flex justify-between">
            <span>{dict.checkout.discount}</span>
            <span>
              -{formatMoney(order.discountAmount, order.currency, settings.defaultLocale)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>
            {dict.checkout.shipping} ({order.shippingMethod?.name})
          </span>
          <span>{formatMoney(order.shippingAmount, order.currency, settings.defaultLocale)}</span>
        </div>
        <div className="text-foreground/70 flex justify-between">
          <span>
            {dict.checkout.vat}
            {order.taxRatePercent !== null ? ` (${order.taxRatePercent}%)` : ""}
          </span>
          <span>{formatMoney(order.taxAmount, order.currency, settings.defaultLocale)}</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-semibold">
          <span>{dict.checkout.total}</span>
          <span>{formatMoney(order.total, order.currency, settings.defaultLocale)}</span>
        </div>
      </section>

      {order.address && (
        <section className="text-foreground/70 mt-8 text-sm">
          <h2 className="text-foreground mb-2 text-lg font-medium">
            {dict.orderConfirmation.shippingTo}
          </h2>
          <p>{order.address.fullName}</p>
          <p>{order.address.street}</p>
          <p>
            {order.address.city}, {order.address.postalCode} {order.address.country}
          </p>
        </section>
      )}

      <p className="text-foreground/60 mt-8 text-xs">
        {dict.checkout.withdrawalNotice}{" "}
        <Link href="/legal/returns" className="underline">
          {dict.checkout.returnPolicy}
        </Link>
        .
      </p>

      {RETURNABLE_STATUSES.includes(order.status) && (
        <section className="mt-6">
          {order.returnRequests.length > 0 && order.returnRequests[0].status !== "rejected" ? (
            <p className="text-foreground/70 text-sm">
              Return status: {order.returnRequests[0].status}
            </p>
          ) : (
            <ReturnRequestForm orderNumber={order.orderNumber} />
          )}
        </section>
      )}
    </main>
  );
}
