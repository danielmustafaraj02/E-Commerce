import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createPaypalOrder } from "@/lib/paypal";
import { canAccessOrder } from "@/lib/orders";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";

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
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }
}
