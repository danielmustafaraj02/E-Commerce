import { z } from "zod";
import { MAX_CART_LINES, MAX_CART_QUANTITY } from "@/lib/cart-limits";
import { isValidPostalCode } from "@/lib/postal-code";

// The parts of a checkout request that every checkout route reads the same
// way (/api/checkout, /api/checkout/express, /api/checkout/quote), so a limit
// changed in one place can't leave another route accepting more. Server-side
// only: the cart's client code imports cart-limits.ts, never zod.

/** The cart: 1–MAX_CART_LINES lines of 1–MAX_CART_QUANTITY pieces each. */
export const cartItemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().positive().max(MAX_CART_QUANTITY),
    })
  )
  .min(1)
  .max(MAX_CART_LINES);

/** A shipping address, with the postal code checked against its country. */
export const shippingAddressSchema = z
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
  });

export const discountCodeSchema = z.string().min(1).max(50);
export const giftVoucherCodeSchema = z.string().min(1).max(64);
