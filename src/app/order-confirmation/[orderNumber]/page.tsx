import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { CatalogImage } from "@/components/catalog-image";
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
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { ReturnRequestForm } from "./return-request-form";
import { localizedName } from "@/lib/product-i18n";
import { isPaypalConfigured } from "@/lib/paypal";
import { LookPurchaseTracker } from "@/components/look-purchase-tracker";
import { GiftFinderPurchaseTracker } from "@/components/gift-finder-purchase-tracker";

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
      include: {
        items: {
          include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
        },
        shippingMethod: true,
        address: true,
        returnRequests: true,
      },
    }),
  ]);
  const dict = getDictionary(uiLocale);
  const paypalEnabled = await isPaypalConfigured();

  if (!order) notFound();
  if (!canAccessOrder(order, session)) notFound();

  return (
    <ShelfMain>
      {order.bundleDiscountAmount > 0 && (
        <LookPurchaseTracker orderNumber={order.orderNumber} saving={order.bundleDiscountAmount} />
      )}
      <GiftFinderPurchaseTracker orderNumber={order.orderNumber} />
      <ShelfHead
        settle
        icon={
          RETURNABLE_STATUSES.includes(order.status) ? (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : undefined
        }
        title={
          order.status === "pending"
            ? dict.orderConfirmation.almostThere
            : dict.orderConfirmation.thankYou
        }
      >
        <p className="shop-lede">
          {order.status === "pending"
            ? dict.orderConfirmation.awaitingPayment(order.orderNumber)
            : dict.orderConfirmation.paymentReceived(order.orderNumber)}
        </p>
        <p className="text-foreground/60 mt-1 text-xs">
          {dict.orderConfirmation.orderDate}:{" "}
          {new Intl.DateTimeFormat(settings.defaultLocale, {
            dateStyle: "long",
          }).format(order.createdAt)}
        </p>
        {cancelled && (
          <p className="text-warning mt-2 text-sm">{dict.orderConfirmation.cancelled}</p>
        )}
      </ShelfHead>
      <ShelfBody>
        {order.status === "pending" && (
          <section className="mt-6">
            <PaymentButtons
              orderNumber={order.orderNumber}
              bankTransferEnabled={settings.bankTransferEnabled && Boolean(settings.bankIban)}
              paypalEnabled={paypalEnabled}
              locale={settings.defaultLocale}
              dict={dict.payment}
            />
          </section>
        )}

        <section className="mt-8">
          <h2 className="shop-h2">{dict.orderConfirmation.items}</h2>
          <ul className="divide-foreground/10 flex flex-col divide-y">
            {order.items.map((item) => {
              const image = item.product?.images[0];
              // The name stored on the order is the Italian source; show the
              // visitor's language when the product still exists.
              const itemName = item.product
                ? localizedName(item.product, uiLocale)
                : item.productName;
              return (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <div className="shop-thumb shop-thumb--cart">
                    {image ? (
                      <CatalogImage
                        src={image.url}
                        alt={image.altText || itemName}
                        fill
                        sizes="64px"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 text-sm">
                    <span>
                      {itemName} &times; {item.quantity}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatMoney(
                        item.unitPrice * item.quantity,
                        order.currency,
                        settings.defaultLocale
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
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
            <h2 className="shop-h2 text-foreground">{dict.orderConfirmation.shippingTo}</h2>
            <p>{order.address.fullName}</p>
            <p>{order.address.street}</p>
            <p>
              {order.address.city}, {order.address.postalCode} {order.address.country}
            </p>
          </section>
        )}

        {settings.companyLegalName && (
          <section className="text-foreground/60 border-foreground/10 mt-8 border-t pt-4 text-xs">
            <p className="text-foreground/70 mb-1 font-medium">{dict.orderConfirmation.soldBy}</p>
            <p>{settings.companyLegalName}</p>
            {settings.companyAddress && <p>{settings.companyAddress}</p>}
            {settings.vatNumber && <p>VAT/P.IVA: {settings.vatNumber}</p>}
          </section>
        )}

        <p className="text-foreground/60 mt-4 text-xs">
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
                {dict.feedback.returnStatusLabel}: {order.returnRequests[0].status}
              </p>
            ) : (
              <ReturnRequestForm
                orderNumber={order.orderNumber}
                labels={{
                  submitted: dict.feedback.returnSubmitted,
                  reason: dict.feedback.returnReasonLabel,
                  request: dict.feedback.requestReturn,
                  submit: dict.feedback.submitRequest,
                  sending: dict.feedback.sending,
                  cancel: dict.account.cancel,
                }}
              />
            )}
          </section>
        )}
      </ShelfBody>
    </ShelfMain>
  );
}
