import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = { productId: string; quantity: number };

export type CartState = {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: qty }] };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mc-cart-v1",
      storage: createJSONStorage(() => {
        // SSR-safe: return a no-op storage on the server; real localStorage on client.
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    }
  )
);
