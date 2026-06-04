"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import type { Product } from "@/types/product";
import { ProductPrice } from "@/components/product/ProductPrice";
import { Button } from "@/components/ui/Button";

/**
 * Mirrors CartDrawer's responsive behaviour — bottom sheet on mobile,
 * right-side drawer from sm+ — so wishlist and cart share one mental model.
 */
function useIsDesktopDrawer() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function WishlistDrawer({ products }: { products: Product[] }) {
  const open = useUIStore((s) => s.isWishlistOpen);
  const close = useUIStore((s) => s.closeWishlist);
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const clear = useWishlistStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.add);

  // Map persisted ids to live product data. Drop any that no longer exist
  // (deleted product / cleared catalog) — same defensive filter as CartDrawer.
  const items = useMemo(
    () =>
      ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [ids, products]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const isDesktop = useIsDesktopDrawer();

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addToCart(product.id, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleAddAllToCart = () => {
    const addable = items.filter((p) => p.stock > 0);
    if (addable.length === 0) {
      toast.error("Nothing in stock to add");
      return;
    }
    addable.forEach((p) => addToCart(p.id, 1));
    toast.success(`${addable.length} ${addable.length === 1 ? "item" : "items"} added to cart`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="wishlist-backdrop"
            className="fixed inset-0 z-50 bg-brand-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <m.aside
            key="wishlist-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            className="fixed z-50 bg-white shadow-petal-lg flex flex-col
              inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl
              sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:max-h-none sm:rounded-l-3xl sm:rounded-t-none"
            initial={isDesktop ? { x: "100%", y: 0 } : { y: "100%", x: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-brand-blush">
              <div>
                <h2 className="font-script text-3xl text-brand-pink leading-none">
                  Your Wishlist
                </h2>
                {items.length > 0 && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold">
                    {items.length} {items.length === 1 ? "favourite" : "favourites"}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close wishlist"
                className="h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink cursor-pointer hover:bg-brand-blush transition-colors inline-flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-brand-blush/60 inline-flex items-center justify-center text-brand-pink-dark">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <p className="font-script text-4xl text-brand-pink mb-2">No favourites yet</p>
                  <p className="text-sm text-brand-ink-muted mb-6">
                    Tap the heart on any flower to save it here.
                  </p>
                  <Button href="/shop" variant="gradient" size="md" onClick={close}>
                    Browse the Shop
                  </Button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((p) => {
                    const outOfStock = p.stock <= 0;
                    return (
                      <li key={p.id} className="flex gap-4">
                        <Link
                          href={`/shop/${p.slug}`}
                          onClick={close}
                          className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-brand-blush cursor-pointer"
                        >
                          <Image
                            src={p.images[0] ?? "/Handmade-1.jpeg"}
                            alt={p.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                          {outOfStock && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="text-[9px] uppercase tracking-wider text-brand-pink-dark font-bold">
                                Sold out
                              </span>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/shop/${p.slug}`}
                              onClick={close}
                              className="font-semibold text-sm text-brand-ink hover:text-brand-pink truncate cursor-pointer"
                            >
                              {p.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                toggle(p.id);
                                toast.success(`Removed ${p.name}`);
                              }}
                              aria-label={`Remove ${p.name} from wishlist`}
                              className="shrink-0 text-brand-ink-muted hover:text-brand-pink cursor-pointer transition-colors p-1 -m-1"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                                <path d="M3 3l8 8M11 3l-8 8" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-1 text-xs">
                            <ProductPrice amount={p.price} size="sm" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            disabled={outOfStock}
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors disabled:text-brand-ink-muted/60 disabled:cursor-not-allowed"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {outOfStock ? "Out of stock" : "Add to cart"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-brand-blush px-6 py-4 space-y-3">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleAddAllToCart}
                >
                  Add all to cart
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    toast.success("Wishlist cleared");
                  }}
                  className="w-full text-[11px] font-semibold uppercase tracking-wider text-brand-ink-muted hover:text-brand-pink-dark cursor-pointer transition-colors"
                >
                  Clear wishlist
                </button>
              </footer>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
