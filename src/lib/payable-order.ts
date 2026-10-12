import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getFeedback } from "@/lib/i18n/feedback";
import { canAccessOrder } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const payRequestSchema = z.object({ orderNumber: z.string().min(1) });

type Feedback = Awaited<ReturnType<typeof getFeedback>>;
type Order = NonNullable<Awaited<ReturnType<typeof db.order.findUnique>>>;

/**
 * The first half of every "pay for this order" route (/api/checkout/pay/stripe
 * and /api/checkout/pay/paypal): rate-limit the visitor, read `{ orderNumber }`
 * from the body, and find an order the visitor may see (canAccessOrder) that is
 * still waiting for payment. Returns the order, or the error response to send
 * as it is, with the message in the visitor's language.
 */
export async function findPayableOrder(
  request: Request,
  rateLimitKey: string
): Promise<{ order: Order; t: Feedback } | { response: NextResponse }> {
  const t = await getFeedback();
  const { success } = await rateLimit(`${rateLimitKey}:${clientIp(request)}`, 10, 60_000);
  if (!success) return { response: NextResponse.json({ error: t.tooManyRequests }, { status: 429 }) };

  const parsed = payRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return { response: NextResponse.json({ error: t.invalidInput }, { status: 400 }) };

  const [session, order] = await Promise.all([
    auth(),
    db.order.findUnique({ where: { orderNumber: parsed.data.orderNumber } }),
  ]);
  if (!order || !canAccessOrder(order, session))
    return { response: NextResponse.json({ error: t.orderNotFound }, { status: 404 }) };
  if (order.status !== "pending")
    return { response: NextResponse.json({ error: t.orderNotAwaitingPayment }, { status: 400 }) };
  return { order, t };
}
