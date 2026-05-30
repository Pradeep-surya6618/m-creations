"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";

export function CheckoutEmptyGuard({ children }: { children: React.ReactNode }) {
  const count = useCartStore((s) => s.items.length);

  if (count === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-script text-5xl text-brand-pink mb-3">Your cart is empty</p>
        <p className="text-sm text-brand-ink-muted mb-8">
          Add a few flowers before checking out 🌸
        </p>
        <Button href="/shop" variant="gradient" size="lg">Browse the Shop</Button>
      </div>
    );
  }
  return <>{children}</>;
}
