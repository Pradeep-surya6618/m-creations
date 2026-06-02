"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";
import { ProductPrice } from "@/components/product/ProductPrice";

export function OrderSummary({ products }: { products: Product[] }) {
  const items = useCartStore((s) => s.items);

  const lineItems = useMemo(
    () =>
      items
        .map((i) => {
          const product = products.find((p) => p.id === i.productId);
          return product ? { ...i, product } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [items, products]
  );

  const subtotal = lineItems.reduce(
    (sum, l) => sum + l.product.price * l.quantity,
    0
  );

  return (
    <div className="bg-white/85 rounded-2xl p-6 shadow-petal-sm border border-white/60">
      <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink font-bold mb-5">
        Order Summary
      </h2>
      <ul className="divide-y divide-brand-blush">
        {lineItems.map((l) => (
          <li key={l.productId} className="flex gap-3 py-3">
            <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-brand-blush">
              <Image
                src={l.product.images[0] ?? "/Handmade-1.jpeg"}
                alt={l.product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-brand-ink leading-tight">{l.product.name}</p>
                <p className="text-xs text-brand-ink-muted">Qty {l.quantity}</p>
              </div>
              <ProductPrice amount={l.product.price * l.quantity} size="sm" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-4 border-t border-brand-blush space-y-2">
        <div className="flex justify-between text-sm text-brand-ink-muted">
          <span>Subtotal</span>
          <ProductPrice amount={subtotal} size="sm" />
        </div>
        <div className="flex justify-between text-sm text-brand-ink-muted">
          <span>Shipping</span>
          <span className="font-semibold text-brand-pink">Free</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-brand-blush">
          <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">Total</span>
          <ProductPrice amount={subtotal} size="lg" />
        </div>
      </div>
    </div>
  );
}
