import { describe, expect, it } from "vitest";
import { MAX_CART_LINES, MAX_CART_QUANTITY } from "@/lib/cart-limits";
import { cartItemsSchema, shippingAddressSchema } from "./checkout-input";

describe("checkout input", () => {
  it("bounds the cart by line count and per-line quantity", () => {
    const line = { productId: "p1", quantity: 1 };
    expect(cartItemsSchema.safeParse([line]).success).toBe(true);
    expect(cartItemsSchema.safeParse([]).success).toBe(false);
    expect(cartItemsSchema.safeParse(Array(MAX_CART_LINES + 1).fill(line)).success).toBe(false);
    expect(cartItemsSchema.safeParse([{ ...line, quantity: MAX_CART_QUANTITY + 1 }]).success).toBe(false);
    expect(cartItemsSchema.safeParse([{ ...line, quantity: "2" }]).data?.[0].quantity).toBe(2);
  });

  it("checks the postal code against the address's country", () => {
    const address = { fullName: "A B", street: "Via Roma 1", city: "Venezia", country: "IT" };
    expect(shippingAddressSchema.safeParse({ ...address, postalCode: "30141" }).success).toBe(true);
    const wrong = shippingAddressSchema.safeParse({ ...address, postalCode: "ABC" });
    expect(wrong.success).toBe(false);
    expect(wrong.error?.issues[0].path).toEqual(["postalCode"]);
  });
});
