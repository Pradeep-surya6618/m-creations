"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./adminNav";
import { cn } from "@/lib/cn";

type Props = { pendingCount: number };

export function AdminBottomBar({ pendingCount }: Props) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin sections"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pointer-events-none"
    >
      <ul
        className="pointer-events-auto mx-auto max-w-md flex items-center justify-around gap-1 bg-brand-pink-dark rounded-full shadow-petal-lg p-1.5"
      >
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const showBadge = item.href === "/admin/orders" && pendingCount > 0;
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "h-11 flex items-center gap-2 rounded-full transition-all duration-300 ease-out cursor-pointer",
                  active
                    ? "bg-white/15 px-3.5"
                    : "px-3 hover:bg-white/5 active:bg-white/10"
                )}
              >
                <span className="relative inline-flex items-center justify-center">
                  <item.Icon
                    size={20}
                    className={cn(
                      "transition-colors",
                      active ? "text-white" : "text-white/60"
                    )}
                  />
                  {showBadge && (
                    <span
                      aria-label={`${pendingCount} pending`}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-white text-brand-pink-dark text-[9px] font-bold inline-flex items-center justify-center"
                    >
                      {pendingCount}
                    </span>
                  )}
                </span>

                {/* Label only shows on the active item — animated via max-width
                    + opacity so the pill grows smoothly rather than popping. */}
                <span
                  className={cn(
                    "text-[13px] font-semibold whitespace-nowrap overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out",
                    active
                      ? "max-w-[140px] opacity-100 text-white"
                      : "max-w-0 opacity-0"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
