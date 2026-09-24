import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { PricingError } from "@/lib/pricing";
import { placeOrderWithRetry } from "@/lib/place-order";
import { giftCardSchema } from "@/lib/gift-card";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { isValidPostalCode } from "@/lib/postal-code";
import { getFeedback } from "@/lib/i18n/feedback";
import { getLocale } from "@/lib/i18n/locale";
import { pricingMessage } from "@/lib/pricing-messages";

const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().positive() }))
    .min(1),
  guestEmail: z.string().email().optional(),
  address: z
    .object({
      fullName: z.string().min(1).max(200),
      street: z.string().min(1).max(300),
      city: z.string().min(1).max(150),
      postalCode: z.string().min(1).max(20),
      country: z.string().length(2),
      phone: z.string().max(30).optional(),
    })
    .refine((address) => isValidPostalCode(address.country, address.postalCode), {
      message: "That postal code doesn't look right for the selected country",
      path: ["postalCode"],
    }),
  shippingMethodId: z.string().min(1),
  discountCode: z.string().min(1).max(50).optional(),
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
      giftCard: input.giftCard,
      userId: session?.user?.id,
      guestEmail: input.guestEmail,
      locale,
    });

    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: pricingMessage(error, t) }, { status: error.status });
    }
    throw error;
  }
}
