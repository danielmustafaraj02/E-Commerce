import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: true,
      orders: { include: { items: true, payments: true } },
      reviews: true,
      consentLogs: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Deliberately not a spread of `user` — never risk leaking a field like
  // passwordHash/mfaSecret just because it got added to the model later.
  const exportData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    addresses: user.addresses,
    orders: user.orders.map((order) => ({
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      discountAmount: order.discountAmount,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items,
      payments: order.payments.map((p) => ({
        provider: p.provider,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        createdAt: p.createdAt,
      })),
    })),
    reviews: user.reviews,
    consentLogs: user.consentLogs,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="my-data-${user.id}.json"`,
    },
  });
}
