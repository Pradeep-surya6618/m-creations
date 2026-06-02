"use client";

import { Toaster } from "sonner";

export function StorefrontToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !text-brand-ink !border !border-brand-blush !shadow-petal-md !rounded-full",
          title: "!text-sm !font-semibold",
        },
      }}
    />
  );
}
