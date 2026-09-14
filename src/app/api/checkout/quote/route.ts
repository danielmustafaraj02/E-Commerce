import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteOrder, PricingError } from "@/lib/pricing";

const quoteSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().positive() }))
    .min(1),
  country: z.string().length(2),
  shippingMethodId: z.string().min(1),
  discountCode: z.string().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
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
      total: quote.total,
      currency: quote.currency,
      pricesIncludeTax: quote.pricesIncludeTax,
    });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
