import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { db } from "@/lib/db";
import { quoteOrder, PricingError, type QuoteInput } from "@/lib/pricing";
import { cancelExpiredOrders, notifyCancelledOrders } from "@/lib/abandoned-orders";
import { geocodeAndStoreAddress } from "@/lib/geocode-address";
import { captureError } from "@/lib/monitoring";

// The single place an Order row gets created — both the full checkout form
// (src/app/api/checkout/route.ts) and Express Checkout
// (src/app/api/checkout/express/route.ts) call this, so stock-decrement,
// discount-usage, and address geocoding logic exists in exactly one place.

export type PlaceOrderAddress = {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type PlaceOrderInput = {
  items: QuoteInput["items"];
  address: PlaceOrderAddress;
  shippingMethodId: string;
  discountCode?: string;
  userId?: string;
  guestEmail?: string | null;
  locale: string;
};

// Express Checkout (src/app/api/checkout/express/route.ts) has no manual
// shipping-method picker — the wallet sheet only collects an address, not a
// method choice. Since every method is priced at €0 right now (see
// scripts/waive-shipping.ts), picking any active one for the destination
// country is equivalent for the customer; this just needs *a* valid,
// resolvable method so quoteOrder's zone/method lookup succeeds. Same query
// shape as src/app/api/shipping/methods/route.ts.
export async function resolveDefaultShippingMethodId(country: string): Promise<string | null> {
  const zone = await db.shippingZone.findFirst({
    where: { countries: { some: { country } } },
    include: { methods: { include: { method: true } } },
  });
  const active = (zone?.methods ?? []).map((link) => link.method).filter((m) => m.active);
  return active[0]?.id ?? null;
}

// For a guest (no account), orderNumber is the only bearer token gating
// access to that order's PII (src/lib/orders.ts, canAccessOrder) — 8 random
// bytes (64 bits) keeps brute-forcing it infeasible even without the rate
// limit on the lookup page as a second layer.
export function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${date}-${randomBytes(8).toString("hex").toUpperCase()}`;
}

async function placeOrderOnce(input: PlaceOrderInput) {
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
          409,
          "product-unavailable"
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
    const address = input.userId
      ? await tx.address.create({
          data: { ...addressFields, user: { connect: { id: input.userId } } },
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
        userId: input.userId ?? undefined,
        guestEmail: input.userId ? null : input.guestEmail,
        status: "pending",
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        taxRatePercent: quote.taxRatePercent,
        shippingAmount: quote.shippingAmount,
        discountAmount: quote.discountAmount,
        total: quote.total,
        currency: quote.currency,
        locale: input.locale,
        addressId: address.id,
        shippingMethodId: quote.shippingMethod.id,
        discountCodeId: quote.discountCodeId,
        items: {
          create: quote.lines.map((line) => ({
            productId: line.product.id,
            productName: line.product.name,
            quantity: line.quantity,
            unitPrice: line.product.price,
            // Snapshot dropshipping info so a later change to the product's
            // supplier/cost doesn't rewrite this order's history.
            supplierId: line.product.supplierId,
            unitCost: line.product.costPrice,
          })),
        },
      },
    });
  });
  return order;
}

// Out-of-stock can just mean expired unpaid orders are still holding the
// stock (the cron may only run daily). Release those and try once more
// before telling a real customer the item is gone.
export async function placeOrderWithRetry(input: PlaceOrderInput) {
  let order;
  try {
    order = await placeOrderOnce(input);
  } catch (error) {
    if (!(error instanceof PricingError) || error.status !== 409) throw error;
    const released = await cancelExpiredOrders();
    if (released.length === 0) throw error;
    after(() => notifyCancelledOrders(released));
    order = await placeOrderOnce(input);
  }

  // Work out where the address is once the customer has their answer, so the
  // admin's order page can show it on a map. Never holds up or fails checkout.
  if (order.addressId) {
    const addressId = order.addressId;
    after(async () => {
      try {
        await geocodeAndStoreAddress(addressId);
      } catch (error) {
        captureError(error, { scope: "geocode-address", addressId });
      }
    });
  }

  return order;
}
