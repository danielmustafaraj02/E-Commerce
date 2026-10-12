import { NextResponse } from "next/server";
import { z } from "zod";
import { cartItemsSchema, discountCodeSchema, giftVoucherCodeSchema } from "@/lib/checkout-input";
import { quoteOrder, PricingError } from "@/lib/pricing";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";
import { pricingMessage } from "@/lib/pricing-messages";

const quoteSchema = z.object({
  items: cartItemsSchema,
  country: z.string().length(2),
  shippingMethodId: z.string().min(1),
  discountCode: discountCodeSchema.optional(),
  giftVoucherCode: giftVoucherCodeSchema.optional(),
  giftCard: z.boolean().optional(),
});

export async function POST(request: Request) {
  const t = await getFeedback();
  const { success } = await rateLimit(`quote:${clientIp(request)}`, 20, 60_000);
  if (!success) {
    return NextResponse.json({ error: t.tooManyRequests }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: t.invalidInput }, { status: 400 });
  }

  try {
    const quote = await quoteOrder(parsed.data);
    return NextResponse.json({
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      taxRatePercent: quote.taxRatePercent,
      missingTaxRule: quote.missingTaxRule,
      shippingAmount: quote.shippingAmount,
      freeShipping: quote.freeShipping,
      discountAmount: quote.discountAmount,
      bundleDiscountAmount: quote.bundleDiscountAmount,
      giftCardAmount: quote.giftCardAmount,
      giftVoucherAppliedAmount: quote.giftVoucherAppliedAmount,
      giftVoucherRemainingBalance: quote.giftVoucherRemainingBalance,
      total: quote.total,
      currency: quote.currency,
      pricesIncludeTax: quote.pricesIncludeTax,
    });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: pricingMessage(error, t) }, { status: error.status });
    }
    throw error;
  }
}
