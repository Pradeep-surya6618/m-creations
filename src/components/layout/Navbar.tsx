"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { Container } from "@/components/ui/Container";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const wishCount = useWishlistStore((s) => s.ids.length);
  const openCart = useUIStore((s) => s.openCart);
  const toggleMenu = useUIStore((s) => s.toggleMobileMenu);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-md shadow-petal-sm"
            : "bg-transparent"
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Logo priority />

            <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-ink hover:text-brand-pink transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                aria-label={`Wishlist, ${wishCount} items`}
                className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur border border-brand-blush text-brand-pink hover:bg-white transition-all"
              >
                ♥
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </Link>

              <IconButton
                label="Open cart"
                count={cartCount}
                onClick={openCart}
              >
                🛍
              </IconButton>

              <button
                type="button"
                onClick={toggleMenu}
                aria-label="Open menu"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur border border-brand-blush text-brand-pink"
              >
                ☰
              </button>
            </div>
          </div>
        </Container>
      </header>
      <MobileMenu links={links} />
    </>
  );
}
