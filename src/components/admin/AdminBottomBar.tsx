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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-blush pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 h-16">
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
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer",
                  active ? "text-brand-pink" : "text-brand-ink-muted hover:text-brand-pink"
                )}
              >
                {/* Active indicator — petal-pink pill on top edge */}
                {active && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-b-full bg-brand-gradient"
                  />
                )}
                <span className="relative text-lg leading-none">
                  {item.icon}
                  {showBadge && (
                    <span
                      aria-label={`${pendingCount} pending`}
                      className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-brand-pink text-white text-[9px] font-bold inline-flex items-center justify-center"
                    >
                      {pendingCount}
                    </span>
                  )}
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
