import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { canAccessOrder } from "@/lib/orders";

const schema = z.object({ orderNumber: z.string().min(1) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [session, order, settings] = await Promise.all([
    auth(),
    db.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } }),
    getStoreSettings(),
  ]);
  if (!order || !canAccessOrder(order, session)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is not awaiting payment" }, { status: 400 });
  }
  if (!settings.codEnabled) {
    return NextResponse.json({ error: "Cash on delivery is not available" }, { status: 503 });
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
