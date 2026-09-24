import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { bundleDiscounts } from "@/lib/looks";
import { deriveProductType } from "@/lib/gift-finder";

// `message` stays English (logs, tests); `code` + `params` let the route return
// the visitor's language instead (see src/lib/pricing-messages.ts).
export type PricingErrorCode =
  | "cart-empty"
  | "product-unavailable"
  | "invalid-quantity"
  | "low-stock"
  | "shipping-unavailable"
  | "discount-invalid"
  | "discount-expired"
  | "discount-limit";

export class PricingError extends Error {
  status: number;
  code?: PricingErrorCode;
  params?: Record<string, string | number>;
  constructor(
    message: string,
    status = 400,
    code?: PricingErrorCode,
    params?: Record<string, string | number>
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.params = params;
  }
}

export type QuoteInput = {
  items: { productId: string; quantity: number }[];
  country: string;
  shippingMethodId: string;
  discountCode?: string;
  // A personalised gift card goes with the order (lib/gift-card.ts). Charged
  // only while the store offers it; otherwise ignored.
  giftCard?: boolean;
};

// Single source of truth for checkout math, used by both the live preview
// (/api/checkout/quote) and the order-committing endpoint (/api/checkout).
// Never trusts client-supplied prices — always re-reads product/shipping/tax
// rows from the DB.
export async function quoteOrder({
  items,
  country,
  shippingMethodId,
  discountCode,
  giftCard,
}: QuoteInput) {
  if (items.length === 0) throw new PricingError("Cart is empty", 400, "cart-empty");

  const settings = await getStoreSettings();
  // Part of the subtotal like any goods, but not reduced by discount codes.
  const giftCardAmount = giftCard && settings.giftCardEnabled ? settings.giftCardPrice : 0;

  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    // The category says whether a piece is a necklace, bracelet or earrings,
    // for the composed-look saving below.
    include: { category: { select: { name: true, nameEn: true, slug: true } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product || !product.active) {
      throw new PricingError(
        `A product in your cart is no longer available`,
        400,
        "product-unavailable"
      );
    }
    if (item.quantity < 1) {
      throw new PricingError(`Invalid quantity for ${product.name}`, 400, "invalid-quantity", {
        name: product.name,
      });
    }
    // Dropshipped items with trackInventory=false have no stock we control —
    // the supplier's availability isn't ours to check, so skip this entirely.
    if (product.trackInventory && product.stockQty < item.quantity) {
      throw new PricingError(
        `${product.name} only has ${product.stockQty} left in stock`,
        409,
        "low-stock",
        { name: product.name, n: product.stockQty }
      );
    }
    return { product, quantity: item.quantity, lineSubtotal: product.price * item.quantity };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineSubtotal, 0);
  const currency = lines[0].product.currency;

  // --- Looks: staff-made sets, composed looks and pairs (lib/looks.ts) ---
  const looks = await db.look.findMany({
    where: { active: true, products: { some: { id: { in: items.map((i) => i.productId) } } } },
    select: {
      id: true,
      discountPercent: true,
      products: { where: { active: true }, select: { id: true } },
    },
  });
  const bundle = bundleDiscounts(
    lines.map((l) => ({ productId: l.product.id, price: l.product.price, quantity: l.quantity })),
    looks.map((look) => ({
      id: look.id,
      discountPercent: look.discountPercent,
      productIds: look.products.map((p) => p.id),
    })),
    Object.fromEntries(lines.map((l) => [l.product.id, deriveProductType(l.product.category)]))
  );
  const bundleDiscountAmount = bundle.total;
  // What the goods actually cost after the bundle saving; discount codes,
  // tax and the free-shipping threshold all work from this.
  const goodsTotal = subtotal - bundleDiscountAmount;

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
    const taxable = line.lineSubtotal - (bundle.byProduct[line.product.id] ?? 0);
    taxAmount += settings.pricesIncludeTax
      ? Math.round((taxable * rate) / (100 + rate))
      : Math.round((taxable * rate) / 100);
  }
  if (giftCardAmount > 0) {
    const rate = rateForCategory(null);
    if (rate === null) {
      missingTaxRule = true;
    } else {
      distinctRates.add(rate);
      taxAmount += settings.pricesIncludeTax
        ? Math.round((giftCardAmount * rate) / (100 + rate))
        : Math.round((giftCardAmount * rate) / 100);
    }
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
    throw new PricingError(
      "Selected shipping method is not available for this destination",
      400,
      "shipping-unavailable"
    );
  }
  const shippingMethod = shippingLink.method;

  // --- Discount code ---
  let discountAmount = 0;
  let discountCodeId: string | null = null;
  if (discountCode) {
    const discount = await db.discountCode.findUnique({ where: { code: discountCode } });
    if (!discount || !discount.active)
      throw new PricingError("Invalid discount code", 400, "discount-invalid");
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      throw new PricingError("Discount code has expired", 400, "discount-expired");
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      throw new PricingError("Discount code has reached its usage limit", 400, "discount-limit");
    }
    discountAmount = discount.percentOff
      ? Math.round((goodsTotal * discount.percentOff) / 100)
      : discount.amountOff
        ? Math.min(discount.amountOff, goodsTotal)
        : 0;
    discountCodeId = discount.id;
  }

  const freeShipping =
    settings.freeShippingThreshold !== null &&
    goodsTotal - discountAmount + giftCardAmount >= settings.freeShippingThreshold;
  const shippingAmount = freeShipping ? 0 : shippingMethod.basePrice;

  // Prices are tax-inclusive by default (settings.pricesIncludeTax), so tax
  // is extracted from — not added on top of — the subtotal.
  const total = settings.pricesIncludeTax
    ? goodsTotal - discountAmount + giftCardAmount + shippingAmount
    : goodsTotal + giftCardAmount + taxAmount - discountAmount + shippingAmount;

  return {
    lines,
    currency,
    // Every receipt reads subtotal - discount + shipping = total, so the gift
    // card is part of the subtotal.
    subtotal: subtotal + giftCardAmount,
    giftCardAmount,
    taxAmount,
    taxRatePercent,
    missingTaxRule,
    shippingAmount,
    freeShipping,
    shippingMethod,
    discountAmount,
    discountCodeId,
    bundleDiscountAmount,
    bundleLookIds: bundle.lookIds,
    total,
    pricesIncludeTax: settings.pricesIncludeTax,
  };
}
