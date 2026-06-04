import { create } from "zustand";

export type UIState = {
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isMobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isWishlistOpen: false,
  isMobileMenuOpen: false,
  // Opening either drawer closes the other so they never stack.
  openCart: () => set({ isCartOpen: true, isWishlistOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  openWishlist: () => set({ isWishlistOpen: true, isCartOpen: false }),
  closeWishlist: () => set({ isWishlistOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
