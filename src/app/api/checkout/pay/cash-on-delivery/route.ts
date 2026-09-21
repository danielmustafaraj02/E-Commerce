import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { canAccessOrder } from "@/lib/orders";
import { getFeedback } from "@/lib/i18n/feedback";

const schema = z.object({ orderNumber: z.string().min(1) });

export async function POST(request: Request) {
  const t = await getFeedback();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: t.invalidInput }, { status: 400 });

  const [session, order, settings] = await Promise.all([
    auth(),
    db.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } }),
    getStoreSettings(),
  ]);
  if (!order || !canAccessOrder(order, session)) {
    return NextResponse.json({ error: t.orderNotFound }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: t.orderNotAwaitingPayment }, { status: 400 });
  }
  if (!settings.codEnabled) {
    return NextResponse.json({ error: t.paymentMethodUnavailable }, { status: 503 });
  }

  const codFee = settings.codFee ?? 0;
  const finalTotal = order.total + codFee;

  // No online payment to confirm — the order can go straight to
  // fulfillment; the customer pays the courier at delivery.
  const updated = await db.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { total: finalTotal, status: "processing" },
    });
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: "cash_on_delivery",
        status: "pending",
        amount: finalTotal,
        currency: order.currency,
      },
    });
    return updatedOrder;
  });

  return NextResponse.json({ total: updated.total, currency: updated.currency });
}
