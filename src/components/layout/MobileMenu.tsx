"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { useUIStore } from "@/store/ui";
import { Logo } from "@/components/brand/Logo";

type Props = {
  links: { href: string; label: string }[];
};

export function MobileMenu({ links }: Props) {
  const open = useUIStore((s) => s.isMobileMenuOpen);
  const close = useUIStore((s) => s.closeMobileMenu);
  const pathname = usePathname();

  // Auto-close when the route changes (e.g. user clicked the Logo, which doesn't carry an onClick).
  useEffect(() => {
    close();
  }, [pathname, close]);

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

  return (
    <AnimatePresence>
      {open && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-50 bg-brand-cream md:hidden flex flex-col"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-brand-blush">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-white border border-brand-blush text-brand-pink cursor-pointer"
            >
              ✕
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-6" aria-label="Mobile primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="font-script text-5xl text-brand-pink hover:opacity-80"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="py-6 text-center text-xs uppercase tracking-[0.3em] text-brand-ink-muted">
            Maria Creations
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
