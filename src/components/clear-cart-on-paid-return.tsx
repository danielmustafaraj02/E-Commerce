"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function ClearCartOnPaidReturn({ paid }: { paid: boolean }) {
  const clearCart = useCartStore((state) => state.clear);

  useEffect(() => {
    if (paid) clearCart();
  }, [clearCart, paid]);

  return null;
}
