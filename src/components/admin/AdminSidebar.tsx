"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./adminNav";
import { cn } from "@/lib/cn";
import { useAdminSidebarStore } from "@/store/adminSidebar";

type Props = { pendingCount: number };

export function AdminSidebar({ pendingCount }: Props) {
  const pathname = usePathname();
  const collapsed = useAdminSidebarStore((s) => s.collapsed);

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        "hidden md:flex md:flex-col md:shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] bg-white border-r border-brand-blush",
        // The width transition is what makes the collapse feel premium.
        "transition-[width] duration-300 ease-out",
        collapsed ? "md:w-[72px]" : "md:w-[220px]"
      )}
    >
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const showBadge = item.href === "/admin/orders" && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              // Native tooltip when collapsed so icon-only users still get the label
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer",
                collapsed ? "h-11 w-11 mx-auto justify-center" : "px-3 py-2.5",
                active
                  ? "bg-brand-gradient text-white shadow-petal-sm"
                  : "text-brand-ink-muted hover:bg-brand-blush/50 hover:text-brand-pink-dark"
              )}
            >
              {/* Icon */}
              <span className="relative w-4 text-base leading-none shrink-0 inline-flex items-center justify-center">
                {item.icon}
                {/* When collapsed, render the pending badge on the icon itself */}
                {showBadge && collapsed && (
                  <span
                    aria-label={`${pendingCount} pending`}
                    className={cn(
                      "absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold inline-flex items-center justify-center",
                      active ? "bg-white text-brand-pink-dark" : "bg-brand-pink text-white"
                    )}
                  >
                    {pendingCount}
                  </span>
                )}
              </span>

              {/* Label + badge — hidden when collapsed.
                  We keep the element in the tree but fade/translate so the
                  width transition has something to animate against. */}
              <span
                className={cn(
                  "flex-1 whitespace-nowrap transition-all duration-200",
                  collapsed
                    ? "opacity-0 -translate-x-2 pointer-events-none w-0"
                    : "opacity-100 translate-x-0"
                )}
              >
                {item.label}
              </span>
              {showBadge && !collapsed && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-opacity duration-200",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-brand-blush text-brand-pink-dark"
                  )}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
