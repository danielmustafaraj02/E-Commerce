import { create } from "zustand";
import { persist } from "zustand/middleware";

// Guest (signed-out) wishlist — device-local only, never synced to the
// account-backed WishlistItem table (see wishlist-actions.ts). Stores a full
// display snapshot, same approach as cart-store.ts, so pages reading it never
// need a round trip to re-fetch product data.
export type WishlistStoreItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
};

type WishlistState = {
  items: WishlistStoreItem[];
  has: (productId: string) => boolean;
  toggle: (item: WishlistStoreItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (productId) => get().items.some((item) => item.productId === productId),
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "wishlist" }
  )
);
