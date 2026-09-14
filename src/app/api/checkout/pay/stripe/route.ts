import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { canAccessOrder } from "@/lib/orders";
import { getStoreSettings } from "@/lib/store-settings";

const schema = z.object({ orderNumber: z.string().min(1) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const [session, order] = await Promise.all([
    auth(),
    db.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } }),
  ]);
  if (!order || !canAccessOrder(order, session)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is not awaiting payment" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = await getStripe();
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }

  const settings = await getStoreSettings();
  const origin = new URL(request.url).origin;

  // A single line item for the already-computed total, rather than one line
  // per product — avoids Stripe re-deriving tax/discount math that diverges
  // from our own (which is the authoritative figure shown on the invoice).
  //
  // `payment_method_types` is left unset by default: for a Checkout Session,
  // omitting it makes Stripe automatically show every payment method enabled
  // in Dashboard > Settings > Payment methods for the order's currency
  // (Apple Pay, Google Pay, iDEAL, Bancontact, SEPA Direct Debit, Link,
  // etc.) — hardcoding this array to `card` is what silently turns all of
  // those off. See README "Payments".
  //
  // Klarna is the one exception, gated behind its own admin toggle rather
  // than left to "enable it in the Dashboard and it just appears": an
  // explicit `payment_method_types` list is required to guarantee Klarna is
  // offered (Stripe's automatic selection doesn't always surface it even
  // when active), but listing a type that ISN'T activated on the account
  // makes session creation fail outright — so this only fires once an admin
  // has confirmed it's active and opted in. Turning it on does mean this
  // session no longer auto-includes whatever else is enabled in the
  // Dashboard (Apple Pay, Google Pay, ...) — only card + Klarna — which is
  // called out in the admin UI.
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "auto",
    ...(settings.klarnaEnabled ? { payment_method_types: ["card", "klarna"] as const } : {}),
    line_items: [
      {
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: `Order ${order.orderNumber}` },
          unit_amount: order.total,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/order-confirmation/${order.orderNumber}?paid=1`,
    cancel_url: `${origin}/order-confirmation/${order.orderNumber}?cancelled=1`,
    metadata: { orderNumber: order.orderNumber },
    ...(order.guestEmail ? { customer_email: order.guestEmail } : {}),
  });

  await db.payment.create({
    data: {
      orderId: order.id,
      provider: "stripe",
      providerTransactionId: checkoutSession.id,
      status: "pending",
      amount: order.total,
      currency: order.currency,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
