import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findPayableOrder } from "@/lib/payable-order";
import { createPaypalOrder } from "@/lib/paypal";
import { captureError } from "@/lib/monitoring";

export async function POST(request: Request) {
  const found = await findPayableOrder(request, "paypal-pay");
  if ("response" in found) return found.response;
  const { order, t } = found;

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
