"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "./QuantityStepper";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";

type Props = {
  productId: string;
  stock: number;
};

export function AddToCartControls({ productId, stock }: Props) {
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const openCart = useUIStore((s) => s.openCart);
  const router = useRouter();
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    add(productId, qty);
    openCart();
  };

  const handleBuy = () => {
    add(productId, qty);
    router.push("/checkout");
  };

  return (
    <div className="space-y-5">
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <span aria-hidden className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold">
            Quantity
          </span>
          <QuantityStepper value={qty} onChange={setQty} max={stock} />
        </div>
      )}
      <div className="flex flex-row gap-3">
        <Button
          variant="gradient"
          size="lg"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 min-w-0 whitespace-nowrap px-4 sm:px-8"
        >
          {outOfStock ? "Sold Out" : "Add to Cart"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleBuy}
          disabled={outOfStock}
          className="flex-1 min-w-0 whitespace-nowrap px-4 sm:px-8"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
