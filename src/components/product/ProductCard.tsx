"use client";

import Image from "next/image";
import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Chip } from "@/components/ui/Chip";
import { ProductPrice } from "./ProductPrice";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import type { Product } from "@/types/product";
import { cn } from "@/lib/cn";

type Props = {
  product: Product;
  categoryLabel?: string;
};

export function ProductCard({ product, categoryLabel }: Props) {
  const add = useCartStore((s) => s.add);
  const isWished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const openCart = useUIStore((s) => s.openCart);
  const reduce = useReducedMotion();

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    add(product.id);
    openCart();
  };

  return (
    <m.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative group bg-white rounded-2xl overflow-hidden shadow-petal-sm hover:shadow-petal-md border border-white/60 flex flex-col"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-brand-blush"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.images[0] ?? "/Handmade-1.jpeg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {categoryLabel && (
          <span className="absolute top-3 left-3">
            <Chip variant="category">{categoryLabel}</Chip>
          </span>
        )}
        {outOfStock && (
          <span className="absolute bottom-3 left-3">
            <Chip variant="category">Sold Out</Chip>
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => toggleWish(product.id)}
        aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={isWished}
        className={cn(
          "absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full",
          "bg-white/85 backdrop-blur border border-white/60 text-brand-pink shadow-petal-sm",
          "transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        )}
      >
        {isWished ? "♥" : "♡"}
      </button>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-semibold text-brand-ink leading-tight hover:text-brand-pink transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-brand-ink-muted line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <ProductPrice amount={product.price} size="md" />
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-full",
              "bg-brand-gradient text-white shadow-petal-sm transition-all",
              "hover:-translate-y-0.5 hover:shadow-petal-md",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
            )}
          >
            {outOfStock ? "Sold" : "Add"}
          </button>
        </div>
      </div>
    </m.article>
  );
}
