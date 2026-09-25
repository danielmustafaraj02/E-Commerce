import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GiftCard } from "@/lib/gift-card";

export const MAX_CART_QUANTITY = 10;

// Display-only snapshot. Price/stock here is never trusted at checkout —
// the server always re-reads the authoritative product row by productId.
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  // The personalised gift card designed for this order, if any. Its price is
  // never stored: checkout charges the store's current price.
  giftCard: GiftCard | null;
  setGiftCard: (card: GiftCard) => void;
  removeGiftCard: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      giftCard: null,
      setGiftCard: (card) => set({ giftCard: card }),
      removeGiftCard: () => set({ giftCard: null }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_CART_QUANTITY) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: Math.min(quantity, MAX_CART_QUANTITY) }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, MAX_CART_QUANTITY) }
                    : i
                ),
        })),
      clear: () => set({ items: [], giftCard: null }),
    }),
    { name: "cart" }
  )
);
