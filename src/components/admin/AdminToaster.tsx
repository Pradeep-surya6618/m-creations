"use client";

import { Toaster } from "sonner";

export function AdminToaster() {
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
