"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { products } from "@/data/products";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Button } from "@/components/ui/Button";

export function CheckoutPreview() {
  const items = useCartStore((s) => s.items);

  const lineItems = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return product ? { ...i, product } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [items]
  );

  const subtotal = lineItems.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0
  );

  if (lineItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-script text-5xl text-brand-pink mb-3">Empty cart</p>
        <p className="text-sm text-brand-ink-muted mb-8">
          Add a few flowers before checking out 🌸
        </p>
        <Button href="/shop" variant="gradient" size="lg">Browse the Shop</Button>
      </div>
    );
  }

  return (
    <div className="bg-white/85 rounded-2xl p-6 lg:p-8 shadow-petal-sm border border-white/60">
      <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-6">
        Your cart preview
      </h2>
      <ul className="divide-y divide-brand-blush">
        {lineItems.map((l) => (
          <li key={l.productId} className="flex gap-4 py-4">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-brand-blush">
              <Image
                src={l.product.images[0] ?? "/Handmade-1.jpeg"}
                alt={l.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-ink text-sm">{l.product.name}</p>
                <p className="text-xs text-brand-ink-muted">Qty {l.quantity}</p>
              </div>
              <ProductPrice amount={l.product.price * l.quantity} size="sm" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-6 border-t border-brand-blush flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">Subtotal</span>
        <ProductPrice amount={subtotal} size="lg" />
      </div>
    </div>
  );
}
