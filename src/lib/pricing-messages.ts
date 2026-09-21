import type { Dictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import type { PricingError } from "@/lib/pricing";

// A PricingError as text in the visitor's language. Unknown codes fall back to
// the English message rather than showing nothing.
export function pricingMessage(error: PricingError, t: Dictionary["feedback"]): string {
  const params = error.params ?? {};
  switch (error.code) {
    case "cart-empty":
      return t.cartEmpty;
    case "product-unavailable":
      return t.productUnavailable;
    case "invalid-quantity":
      return applyTemplate(t.invalidQuantity, params);
    case "low-stock":
      return applyTemplate(t.lowStock, params);
    case "shipping-unavailable":
      return t.shippingUnavailable;
    case "discount-invalid":
      return t.discountInvalid;
    case "discount-expired":
      return t.discountExpired;
    case "discount-limit":
      return t.discountLimitReached;
    default:
      return error.message;
  }
}
