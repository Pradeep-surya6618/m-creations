import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => {
          const has = state.ids.includes(id);
          return {
            ids: has ? state.ids.filter((x) => x !== id) : [...state.ids, id],
          };
        }),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "mc-wishlist-v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return window.localStorage;
      }),
    }
  )
);
