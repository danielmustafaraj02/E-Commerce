import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";

export class PricingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type QuoteInput = {
  items: { productId: string; quantity: number }[];
  country: string;
  shippingMethodId: string;
  discountCode?: string;
};

// Single source of truth for checkout math, used by both the live preview
// (/api/checkout/quote) and the order-committing endpoint (/api/checkout).
// Never trusts client-supplied prices — always re-reads product/shipping/tax
// rows from the DB.
export async function quoteOrder({ items, country, shippingMethodId, discountCode }: QuoteInput) {
  if (items.length === 0) throw new PricingError("Cart is empty");

  const settings = await getStoreSettings();

  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || !product.active) {
      throw new PricingError(`A product in your cart is no longer available`);
    }
    if (item.quantity < 1) {
      throw new PricingError(`Invalid quantity for ${product.name}`);
    }
    // Dropshipped items with trackInventory=false have no stock we control —
    // the supplier's availability isn't ours to check, so skip this entirely.
    if (product.trackInventory && product.stockQty < item.quantity) {
      throw new PricingError(`${product.name} only has ${product.stockQty} left in stock`, 409);
    }
    return { product, quantity: item.quantity, lineSubtotal: product.price * item.quantity };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0);
  const currency = lines[0].product.currency;

  // --- Tax: itemized per line, by destination country + product category ---
  const taxRules = await db.taxRule.findMany({ where: { country } });
  const rateForCategory = (categoryId: string | null) => {
    const specific = categoryId ? taxRules.find((r) => r.categoryId === categoryId) : undefined;
    if (specific) return specific.ratePercent;
    const general = taxRules.find((r) => r.categoryId === null);
    return general ? general.ratePercent : null;
  };

  let taxAmount = 0;
  let missingTaxRule = false;
  const distinctRates = new Set<number>();

  for (const line of lines) {
    const rate = rateForCategory(line.product.categoryId);
    if (rate === null) {
      missingTaxRule = true;
      continue;
    }
    distinctRates.add(rate);
    taxAmount += settings.pricesIncludeTax
      ? Math.round((line.lineSubtotal * rate) / (100 + rate))
      : Math.round((line.lineSubtotal * rate) / 100);
  }
  const taxRatePercent = distinctRates.size === 1 ? [...distinctRates][0] : null;

  // --- Shipping: method must belong to a zone covering the destination ---
  const zone = await db.shippingZone.findFirst({
    where: { countries: { some: { country } } },
    include: { methods: { include: { method: true } } },
  });
  const shippingLink = zone?.methods.find(
    (link) => link.methodId === shippingMethodId && link.method.active
  );
  if (!shippingLink) {
    throw new PricingError("Selected shipping method is not available for this destination");
  }
  const shippingMethod = shippingLink.method;

  // --- Discount code ---
  let discountAmount = 0;
  let discountCodeId: string | null = null;
  if (discountCode) {
    const discount = await db.discountCode.findUnique({ where: { code: discountCode } });
    if (!discount || !discount.active) throw new PricingError("Invalid discount code");
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      throw new PricingError("Discount code has expired");
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      throw new PricingError("Discount code has reached its usage limit");
    }
    discountAmount = discount.percentOff
      ? Math.round((subtotal * discount.percentOff) / 100)
      : discount.amountOff
        ? Math.min(discount.amountOff, subtotal)
        : 0;
    discountCodeId = discount.id;
  }

  const freeShipping =
    settings.freeShippingThreshold !== null &&
    subtotal - discountAmount >= settings.freeShippingThreshold;
  const shippingAmount = freeShipping ? 0 : shippingMethod.basePrice;

  // Prices are tax-inclusive by default (settings.pricesIncludeTax), so tax
  // is extracted from — not added on top of — the subtotal.
  const total = settings.pricesIncludeTax
    ? subtotal - discountAmount + shippingAmount
    : subtotal + taxAmount - discountAmount + shippingAmount;

  return {
    lines,
    currency,
    subtotal,
    taxAmount,
    taxRatePercent,
    missingTaxRule,
    shippingAmount,
    freeShipping,
    shippingMethod,
    discountAmount,
    discountCodeId,
    total,
    pricesIncludeTax: settings.pricesIncludeTax,
  };
}
