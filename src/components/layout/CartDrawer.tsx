"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import type { Product } from "@/types/product";
import { ProductPrice } from "@/components/product/ProductPrice";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { Button } from "@/components/ui/Button";

function useIsDesktopDrawer() {
  // matches our Tailwind `sm:` breakpoint
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

export function CartDrawer({ products }: { products: Product[] }) {
  const open = useUIStore((s) => s.isCartOpen);
  const close = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

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

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-brand-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <m.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed z-50 bg-white shadow-petal-lg flex flex-col
              inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl
              sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md sm:max-h-none sm:rounded-l-3xl sm:rounded-t-none"
            initial={isDesktop ? { x: "100%", y: 0 } : { y: "100%", x: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={isDesktop ? { x: "100%" } : { y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-brand-blush">
              <h2 className="font-script text-3xl text-brand-pink">Your Cart</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink cursor-pointer hover:bg-brand-blush transition-colors"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lineItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-script text-4xl text-brand-pink mb-3">Empty</p>
                  <p className="text-sm text-brand-ink-muted mb-6">
                    Your cart hasn&apos;t met a flower yet 🌸
                  </p>
                  <Button href="/shop" variant="gradient" size="md" onClick={close}>
                    Browse the Shop
                  </Button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {lineItems.map((l) => (
                    <li key={l.productId} className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-brand-blush">
                        <Image
                          src={l.product.images[0] ?? "/Handmade-1.jpeg"}
                          alt={l.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${l.product.slug}`}
                          onClick={close}
                          className="font-semibold text-sm text-brand-ink hover:text-brand-pink"
                        >
                          {l.product.name}
                        </Link>
                        <div className="mt-1 text-xs text-brand-ink-muted">
                          <ProductPrice amount={l.product.price} size="sm" />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <QuantityStepper
                            value={l.quantity}
                            onChange={(q) => setQty(l.productId, q)}
                            max={l.product.stock || 99}
                          />
                          <button
                            type="button"
                            onClick={() => { remove(l.productId); toast.success("Removed"); }}
                            aria-label={`Remove ${l.product.name} from cart`}
                            className="text-xs text-brand-ink-muted hover:text-brand-pink underline-offset-2 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lineItems.length > 0 && (
              <footer className="border-t border-brand-blush px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.15em] text-brand-ink-muted">
                    Subtotal
                  </span>
                  <ProductPrice amount={subtotal} size="lg" />
                </div>
                <Button href="/checkout" variant="gradient" size="lg" className="w-full" onClick={close}>
                  Checkout
                </Button>
                <p className="text-[10px] text-center text-brand-ink-muted">
                  Shipping calculated at the next step.
                </p>
              </footer>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
