import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { quoteOrder, PricingError } from "@/lib/pricing";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().positive() }))
    .min(1),
  guestEmail: z.string().email().optional(),
  address: z.object({
    fullName: z.string().min(1).max(200),
    street: z.string().min(1).max(300),
    city: z.string().min(1).max(150),
    postalCode: z.string().min(1).max(20),
    country: z.string().length(2),
    phone: z.string().max(30).optional(),
  }),
  shippingMethodId: z.string().min(1),
  discountCode: z.string().min(1).max(50).optional(),
  turnstileToken: z.string().optional(),
});

function generateOrderNumber() {
  // For a guest (no account), orderNumber is the only bearer token gating
  // access to that order's PII (src/lib/orders.ts, canAccessOrder) — 8
  // random bytes (64 bits) keeps brute-forcing it infeasible even without
  // the rate limit on the lookup page as a second layer.
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${date}-${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const { success } = await rateLimit(`checkout:${clientIp(request)}`, 10, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const captchaOk = await verifyTurnstile(input.turnstileToken ?? null, clientIp(request));
  if (!captchaOk) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user && !input.guestEmail) {
    return NextResponse.json(
      { error: "Sign in or provide an email to check out as a guest" },
      { status: 400 }
    );
  }

  try {
    const quote = await quoteOrder({
      items: input.items,
      country: input.address.country,
      shippingMethodId: input.shippingMethodId,
      discountCode: input.discountCode,
    });

    const orderNumber = generateOrderNumber();

    const order = await db.$transaction(async (tx) => {
      for (const line of quote.lines) {
        // Dropshipped items (trackInventory=false) have no stock of ours to
        // decrement — the supplier owns availability.
        if (!line.product.trackInventory) continue;

        const result = await tx.product.updateMany({
          where: { id: line.product.id, stockQty: { gte: line.quantity } },
          data: { stockQty: { decrement: line.quantity } },
        });
        if (result.count !== 1) {
          throw new PricingError(
            `${line.product.name} is no longer available in that quantity`,
            409
          );
        }
      }

      const addressFields = {
        fullName: input.address.fullName,
        street: input.address.street,
        city: input.address.city,
        postalCode: input.address.postalCode,
        country: input.address.country,
        phone: input.address.phone,
      };
      const address = session?.user?.id
        ? await tx.address.create({
            data: { ...addressFields, user: { connect: { id: session.user.id } } },
          })
        : await tx.address.create({ data: addressFields });

      if (quote.discountCodeId) {
        await tx.discountCode.update({
          where: { id: quote.discountCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? undefined,
          guestEmail: session?.user ? null : input.guestEmail,
          status: "pending",
          subtotal: quote.subtotal,
          taxAmount: quote.taxAmount,
          taxRatePercent: quote.taxRatePercent,
          shippingAmount: quote.shippingAmount,
          discountAmount: quote.discountAmount,
          total: quote.total,
          currency: quote.currency,
          addressId: address.id,
          shippingMethodId: quote.shippingMethod.id,
          discountCodeId: quote.discountCodeId,
          items: {
            create: quote.lines.map((line) => ({
              productId: line.product.id,
              productName: line.product.name,
              quantity: line.quantity,
              unitPrice: line.product.price,
              // Snapshot dropshipping info so a later change to the
              // product's supplier/cost doesn't rewrite this order's history.
              supplierId: line.product.supplierId,
              unitCost: line.product.costPrice,
            })),
          },
        },
      });
    });

    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
