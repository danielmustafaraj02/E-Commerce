import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createPaypalOrder } from "@/lib/paypal";
import { canAccessOrder } from "@/lib/orders";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";
import { captureError } from "@/lib/monitoring";

const schema = z.object({ orderNumber: z.string().min(1) });

export async function POST(request: Request) {
  const t = await getFeedback();
  const { success } = await rateLimit(`paypal-pay:${clientIp(request)}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: t.tooManyRequests }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: t.invalidInput }, { status: 400 });
  }

  const [session, order] = await Promise.all([
    auth(),
    db.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } }),
  ]);
  if (!order || !canAccessOrder(order, session)) {
    return NextResponse.json({ error: t.orderNotFound }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: t.orderNotAwaitingPayment }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  try {
    const paypalOrder = await createPaypalOrder({
      orderNumber: order.orderNumber,
      amountCents: order.total,
      currency: order.currency,
      returnUrl: `${origin}/api/checkout/pay/paypal/return?orderNumber=${order.orderNumber}`,
      cancelUrl: `${origin}/order-confirmation/${order.orderNumber}?cancelled=1`,
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "paypal",
        providerTransactionId: paypalOrder.id,
        status: "pending",
        amount: order.total,
        currency: order.currency,
      },
    });

    return NextResponse.json({ url: paypalOrder.approveUrl });
  } catch (error) {
    // PayPal's raw response goes to the log, never to the browser: it carries
    // the debug id and the account-level reason (PAYEE_ACCOUNT_RESTRICTED,
    // for one), which is operator information, not shopper information.
    captureError(error, {
      route: "checkout/pay/paypal",
      orderNumber: order.orderNumber,
      hint: paypalFailureHint((error as Error).message),
    });
    return NextResponse.json({ error: t.paymentMethodUnavailable }, { status: 503 });
  }
}

// Turns the one PayPal failure that is never a bug in this code into a line an
// operator can act on, instead of leaving a raw 422 in the log.
function paypalFailureHint(message: string) {
  if (message.includes("PAYEE_ACCOUNT_RESTRICTED")) {
    return "The PayPal business account receiving the money is restricted. Nothing to fix in this app: sign in to PayPal, open the Resolution Center and clear the limitation (usually a pending email, identity or business verification).";
  }
  if (message.includes("PAYEE_ACCOUNT_LOCKED_OR_CLOSED")) {
    return "The PayPal business account is locked or closed. Contact PayPal support.";
  }
  if (message.includes("invalid_client") || message.includes("authenticate")) {
    return "PayPal rejected the credentials. Check the client ID/secret in Admin > Settings > Payments, and that they are LIVE credentials if PAYPAL_ENV is live.";
  }
  return undefined;
}
