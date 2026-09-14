import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createPaypalOrder } from "@/lib/paypal";
import { canAccessOrder } from "@/lib/orders";

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
