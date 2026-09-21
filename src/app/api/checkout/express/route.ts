import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PricingError } from "@/lib/pricing";
import { placeOrderWithRetry, resolveDefaultShippingMethodId } from "@/lib/place-order";
import { getStripe } from "@/lib/stripe";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isValidPostalCode } from "@/lib/postal-code";
import { getFeedback } from "@/lib/i18n/feedback";
import { getLocale } from "@/lib/i18n/locale";
import { pricingMessage } from "@/lib/pricing-messages";

// One-tap Apple Pay / Google Pay: the browser's wallet sheet collects the
// shipping address and payment method (Face ID/fingerprint-confirmed)
// instead of our own form, then this route creates the order exactly like
// the full checkout form does (same placeOrderWithRetry — same stock
// decrement, same address/discount handling) and starts a Stripe
// PaymentIntent for the order's server-computed total. The client then
// calls stripe.confirmPayment() with the clientSecret this returns.
//
// No Turnstile check here (unlike /api/checkout): completing an Apple Pay/
// Google Pay payment requires real biometric confirmation on a real device,
// a stronger anti-automation signal than a captcha token would add. Rate
// limiting still applies.
const expressCheckoutSchema = z.object({
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
  discountCode: z.string().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  const t = await getFeedback();
  const locale = await getLocale();
  const { success } = await rateLimit(`checkout-express:${clientIp(request)}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: t.tooManyRequests }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = expressCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.invalidInput, issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const session = await auth();
  if (!session?.user && !input.guestEmail) {
    return NextResponse.json({ error: t.guestEmailRequired }, { status: 400 });
  }

  const shippingMethodId = await resolveDefaultShippingMethodId(input.address.country);
  if (!shippingMethodId) {
    return NextResponse.json({ error: t.shippingUnavailable }, { status: 400 });
  }

  try {
    const order = await placeOrderWithRetry({
      items: input.items,
      address: input.address,
      shippingMethodId,
      discountCode: input.discountCode,
      userId: session?.user?.id,
      guestEmail: input.guestEmail,
      locale,
    });

    const stripe = await getStripe();
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: order.total,
        currency: order.currency.toLowerCase(),
        metadata: { orderNumber: order.orderNumber },
        // card covers Apple Pay/Google Pay too — both ride the card rails.
        automatic_payment_methods: { enabled: true },
      },
      // One PaymentIntent per order: a retried request (double tap, flaky
      // network) replays the same one instead of creating a duplicate charge
      // attempt.
      { idempotencyKey: `express-checkout-intent:${order.orderNumber}` }
    );

    // Mirrors src/app/api/checkout/pay/stripe/route.ts's Payment row — the
    // webhook (payment_intent.succeeded) looks this up by
    // providerTransactionId the same way it does for a Checkout Session.
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "stripe",
        providerTransactionId: paymentIntent.id,
        status: "pending",
        amount: order.total,
        currency: order.currency,
      },
    });

    return NextResponse.json(
      { orderNumber: order.orderNumber, clientSecret: paymentIntent.client_secret },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: pricingMessage(error, t) }, { status: error.status });
    }
    throw error;
  }
}
