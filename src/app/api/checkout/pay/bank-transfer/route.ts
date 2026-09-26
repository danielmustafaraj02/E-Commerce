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
  if (!settings.bankTransferEnabled || !settings.bankIban) {
    return NextResponse.json({ error: t.paymentMethodUnavailable }, { status: 503 });
  }

  await db.payment.create({
    data: {
      orderId: order.id,
      provider: "bank_transfer",
      status: "pending",
      amount: order.total,
      currency: order.currency,
    },
  });

  return NextResponse.json({
    bankAccountHolder: settings.bankAccountHolder,
    bankIban: settings.bankIban,
    bankBic: settings.bankBic,
    reference: order.orderNumber,
    amount: order.total,
    currency: order.currency,
  });
}
