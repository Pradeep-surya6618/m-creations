"use client";

import { useAdminSidebarStore } from "@/store/adminSidebar";

type Props = {
  adminEmail: string;
  pendingCount: number;
};

export function AdminAppBar({ adminEmail, pendingCount }: Props) {
  const collapsed = useAdminSidebarStore((s) => s.collapsed);
  const toggle = useAdminSidebarStore((s) => s.toggle);

  const initial = adminEmail.trim().charAt(0).toUpperCase() || "M";

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/85 backdrop-blur-md border-b border-brand-blush flex items-center gap-3 px-3 sm:px-5">
      {/* Sidebar toggle — desktop only (mobile uses the bottom bar) */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={!collapsed}
        className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl text-brand-ink-muted hover:text-brand-pink hover:bg-brand-blush/40 transition-colors cursor-pointer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Brand wordmark */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-script text-2xl sm:text-3xl text-brand-pink leading-none truncate">
          Maria · Admin
        </span>
      </div>

      <div className="flex-1" />

      {/* Pending verifications pill — only when > 0 */}
      {pendingCount > 0 && (
        <a
          href="/admin/orders"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blush/60 text-brand-pink-dark text-xs font-semibold cursor-pointer hover:bg-brand-blush transition-colors"
        >
          <span className="h-2 w-2 rounded-full bg-brand-pink animate-pulse" />
          {pendingCount} pending
        </a>
      )}

      {/* Avatar + email */}
      <div className="hidden md:flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-brand-cream border border-brand-blush max-w-[220px]">
        <span className="h-7 w-7 rounded-full bg-brand-gradient text-white text-xs font-bold inline-flex items-center justify-center shadow-petal-sm">
          {initial}
        </span>
        <span className="text-xs text-brand-ink-muted truncate">{adminEmail}</span>
      </div>

      {/* Sign out */}
      <form
        action="/api/admin/logout"
        method="post"
        onSubmit={() => {
          sessionStorage.setItem("mc:admin-goodbye", "Signed out — see you soon!");
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-brand-gradient text-white text-xs font-bold uppercase tracking-wider shadow-petal-sm hover:shadow-petal-md cursor-pointer transition-shadow"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </form>
    </header>
  );
}
