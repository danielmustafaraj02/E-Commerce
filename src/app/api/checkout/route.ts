import { after, NextResponse } from "next/server";
import { z } from "zod";
import { cartItemsSchema, discountCodeSchema, giftVoucherCodeSchema, shippingAddressSchema } from "@/lib/checkout-input";
import { auth } from "@/auth";
import { PricingError } from "@/lib/pricing";
import { placeOrderWithRetry } from "@/lib/place-order";
import { giftCardSchema } from "@/lib/gift-card";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { getFeedback } from "@/lib/i18n/feedback";
import { getLocale } from "@/lib/i18n/locale";
import { pricingMessage } from "@/lib/pricing-messages";
import { sendOrderStatusEmail } from "@/lib/email";
import { captureError } from "@/lib/monitoring";

const checkoutSchema = z.object({
  items: cartItemsSchema,
  guestEmail: z.string().email().optional(),
  address: shippingAddressSchema,
  shippingMethodId: z.string().min(1),
  discountCode: discountCodeSchema.optional(),
  giftVoucherCode: giftVoucherCodeSchema.optional(),
  giftCard: giftCardSchema.optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const t = await getFeedback();
  const locale = await getLocale();
  const { success } = await rateLimit(`checkout:${clientIp(request)}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: t.tooManyRequests }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.invalidInput, issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const captchaOk = await verifyTurnstile(input.turnstileToken ?? null, clientIp(request));
  if (!captchaOk) {
    return NextResponse.json({ error: t.verificationFailed }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user && !input.guestEmail) {
    return NextResponse.json({ error: t.guestEmailRequired }, { status: 400 });
  }

  try {
    const order = await placeOrderWithRetry({
      items: input.items,
      address: input.address,
      shippingMethodId: input.shippingMethodId,
      discountCode: input.discountCode,
      giftVoucherCode: input.giftVoucherCode,
      giftCard: input.giftCard,
      userId: session?.user?.id,
      guestEmail: input.guestEmail,
      locale,
    });

    if (order.status === "paid") {
      after(async () => {
        try {
          await sendOrderStatusEmail({
            orderNumber: order.orderNumber,
            status: "paid",
            trackingNumber: null,
            guestEmail: input.guestEmail ?? null,
            user: session?.user?.email ? { email: session.user.email } : null,
          });
        } catch (error) {
          captureError(error, {
            scope: "zero-total-checkout-email",
            orderNumber: order.orderNumber,
          });
        }
      });
    }

    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: pricingMessage(error, t) }, { status: error.status });
    }
    throw error;
  }
}
