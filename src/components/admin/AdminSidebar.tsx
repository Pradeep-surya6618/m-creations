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
                "group relative flex items-center rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer",
                // Two distinct shapes: a 44px square when collapsed (gap removed
                // so the lone icon truly centers under justify-center), or a
                // full-width row with internal padding + 12px gap when expanded.
                collapsed
                  ? "h-11 w-11 mx-auto justify-center"
                  : "px-3 py-2.5 gap-3",
                active
                  ? "bg-brand-gradient text-white shadow-petal-sm"
                  : "text-brand-ink-muted hover:bg-brand-blush/50 hover:text-brand-pink-dark"
              )}
            >
              {/* Icon — only child when collapsed, so justify-center actually centers it. */}
              <span className="relative shrink-0 inline-flex items-center justify-center">
                <item.Icon size={20} />
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

              {/* Label + inline badge — not rendered at all when collapsed,
                  so they can't absorb flex space and shove the icon left. */}
              {!collapsed && (
                <>
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {showBadge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        active
                          ? "bg-white/25 text-white"
                          : "bg-brand-blush text-brand-pink-dark"
                      )}
                    >
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
