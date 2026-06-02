"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./adminNav";
import { cn } from "@/lib/cn";

type Props = {
  adminEmail: string;
  pendingCount: number;
};

export function AdminSidebar({ adminEmail, pendingCount }: Props) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col md:w-[220px] md:shrink-0 md:h-screen md:sticky md:top-0 bg-white border-r border-brand-blush">
      <div className="px-5 pt-6 pb-4 border-b border-brand-blush">
        <span className="font-script text-3xl text-brand-pink leading-none">Maria · Admin</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
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
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer",
                active
                  ? "bg-brand-gradient text-white shadow-petal-sm"
                  : "text-brand-ink-muted hover:bg-brand-blush/50"
              )}
            >
              <span className="w-4 text-base leading-none">{item.icon}</span>
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
    </aside>
  );
}
