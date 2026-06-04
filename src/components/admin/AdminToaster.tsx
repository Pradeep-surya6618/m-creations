"use client";

import { useEffect } from "react";
import { Toaster, toast } from "sonner";

// One-shot success messages handed across full-page navigations (login →
// dashboard, sign-out → login) via sessionStorage. The producing page calls
// sessionStorage.setItem(key, message) just before triggering the redirect;
// the next AdminToaster to mount flushes and clears them.
const PENDING_TOAST_KEYS = ["mc:admin-welcome", "mc:admin-goodbye"] as const;

export function AdminToaster() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const key of PENDING_TOAST_KEYS) {
      const msg = sessionStorage.getItem(key);
      if (!msg) continue;
      sessionStorage.removeItem(key);
      toast.success(msg);
    }
  }, []);

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !text-brand-ink !border !border-brand-blush !shadow-petal-md !rounded-full",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-brand-ink-muted",
          success: "[&_[data-icon]]:!text-brand-pink-dark",
          error: "[&_[data-icon]]:!text-red-600",
        },
      }}
    />
  );
}
