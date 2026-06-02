"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { adminNav } from "./adminNav";
import { cn } from "@/lib/cn";

type Props = { adminEmail: string; pendingCount: number };

export function AdminMobileTopbar({ adminEmail, pendingCount }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-brand-blush bg-white">
        <span className="font-script text-2xl text-brand-pink leading-none">
          Maria · Admin
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="cursor-pointer h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink inline-flex items-center justify-center"
        >
          ☰
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              className="fixed inset-0 z-50 bg-brand-ink/30 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <m.aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-brand-blush md:hidden flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="px-5 py-5 border-b border-brand-blush flex items-center justify-between">
                <span className="font-script text-2xl text-brand-pink">
                  Maria · Admin
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="cursor-pointer h-9 w-9 rounded-full bg-brand-cream border border-brand-blush text-brand-pink inline-flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {adminNav.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const showBadge =
                    item.href === "/admin/orders" && pendingCount > 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all cursor-pointer",
                        active
                          ? "bg-brand-gradient text-white"
                          : "text-brand-ink-muted hover:bg-brand-blush/50"
                      )}
                    >
                      <span className="w-4 text-base">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <span className="bg-brand-blush text-brand-pink-dark px-2 py-0.5 rounded-full text-[10px]">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-5 py-4 border-t border-brand-blush text-xs space-y-2">
                <p className="text-brand-ink-muted truncate">{adminEmail}</p>
                <form action="/api/admin/logout" method="post">
                  <button
                    type="submit"
                    className="text-brand-pink font-semibold cursor-pointer hover:underline"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
