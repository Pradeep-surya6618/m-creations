import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AdminSidebarState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
};

export const useAdminSidebarStore = create<AdminSidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: "mc-admin-sidebar-v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return window.localStorage;
      }),
    }
  )
);
