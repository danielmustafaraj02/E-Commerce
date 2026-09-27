import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/place-order";
import { giftVoucherPurchaseSchema, GIFT_VOUCHER_CURRENCY } from "@/lib/gift-voucher";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getLocale } from "@/lib/i18n/locale";
import { getGiftVoucherCopy } from "@/lib/gift-voucher-copy";
import { getFeedback } from "@/lib/i18n/feedback";

export async function POST(request: Request) {
  const feedback = await getFeedback();
  const { success } = await rateLimit(`gift-voucher-purchase:${clientIp(request)}`, 5, 60 * 60_000);
  if (!success) {
    return NextResponse.json({ error: feedback.tooManyRequests }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = giftVoucherPurchaseSchema.safeParse(body);
  const locale = await getLocale();
  const copy = getGiftVoucherCopy(locale);
  if (!parsed.success) {
    return NextResponse.json({ error: copy.formError }, { status: 400 });
  }

  const session = await auth();
  const buyerEmail = session?.user?.email || parsed.data.buyerEmail;
  if (!buyerEmail) return NextResponse.json({ error: copy.formError }, { status: 400 });

  const captchaOk = await verifyTurnstile(parsed.data.turnstileToken ?? null, clientIp(request));
  if (!captchaOk) return NextResponse.json({ error: copy.formError }, { status: 400 });

  const amount = parsed.data.amount;
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session?.user?.id,
      guestEmail: session?.user ? null : buyerEmail.toLowerCase(),
      status: "pending",
      subtotal: amount,
      taxAmount: 0,
      taxRatePercent: null,
      shippingAmount: 0,
      discountAmount: 0,
      total: amount,
      currency: GIFT_VOUCHER_CURRENCY,
      locale,
      giftVoucherPurchaseAmount: amount,
      giftVoucherRecipientEmail: parsed.data.recipientEmail.toLowerCase(),
      giftVoucherRecipientName: parsed.data.recipientName || null,
      giftVoucherSenderName: parsed.data.senderName || null,
      giftVoucherMessage: parsed.data.message || null,
    },
    select: { orderNumber: true },
  });

  return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
}
