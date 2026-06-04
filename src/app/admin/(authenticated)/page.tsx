import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboardStats";
import { AdminButton } from "@/components/admin/AdminButton";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Admin · Dashboard" };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const needsAttention =
    stats.pendingVerification > 0 || stats.outOfStock > 0;

  return (
    <div className="space-y-6 w-full">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-brand-pink-dark font-bold">
            Welcome back
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold text-brand-ink">
            Today at <span className="font-script text-brand-pink">Maria Creations</span>
          </h1>
          <p className="mt-1.5 text-sm text-brand-ink-muted">
            {needsAttention
              ? "A couple of things need your attention."
              : "Everything's running smoothly — nothing urgent."}
          </p>
        </div>
        <div className="flex gap-2">
          <AdminButton href="/admin/products/new" variant="primary">+ Product</AdminButton>
          <AdminButton href="/admin/categories/new" variant="secondary">+ Category</AdminButton>
        </div>
      </header>

      {/* ─── Stat tiles ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile
          icon={<ClockIcon />}
          label="Pending verify"
          value={stats.pendingVerification}
          subtitle={stats.pendingVerification > 0 ? "Needs action" : "All caught up"}
          tone={stats.pendingVerification > 0 ? "alert" : "default"}
          href="/admin/orders?filter=Verify"
        />
        <StatTile
          icon={<TrendUpIcon />}
          label="Revenue · 7d"
          value={formatPrice(stats.revenueThisWeek)}
          subtitle={`${stats.paidThisWeek} ${stats.paidThisWeek === 1 ? "order" : "orders"} paid`}
          tone={stats.revenueThisWeek > 0 ? "ok" : "default"}
          href="/admin/orders?filter=Paid"
          large
        />
        <StatTile
          icon={<FlowerIcon />}
          label="Products live"
          value={stats.productsLive}
          subtitle="In the catalog"
          tone="default"
          href="/admin/products"
        />
        <StatTile
          icon={<AlertIcon />}
          label="Out of stock"
          value={stats.outOfStock}
          subtitle={stats.outOfStock > 0 ? "Restock needed" : "Fully stocked"}
          tone={stats.outOfStock > 0 ? "warn" : "default"}
          href="/admin/products?stock=out"
        />
      </div>

      {/* ─── Action items (only when there's something to do) ──────────── */}
      {needsAttention && (
        <section className="rounded-2xl bg-gradient-to-br from-brand-pink-dark to-brand-pink overflow-hidden">
          <div className="p-5 sm:p-6 text-white">
            <p className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-90">
              On your plate
            </p>
            <h2 className="mt-1.5 text-lg font-bold">A few things to look at</h2>
            <ul className="mt-4 space-y-2">
              {stats.pendingVerification > 0 && (
                <ActionItem
                  href="/admin/orders?filter=Verify"
                  primary={`Verify ${stats.pendingVerification} ${stats.pendingVerification === 1 ? "payment" : "payments"}`}
                  secondary="Customers are waiting for you to confirm their bank transfer."
                />
              )}
              {stats.outOfStock > 0 && (
                <ActionItem
                  href="/admin/products?stock=out"
                  primary={`Restock ${stats.outOfStock} ${stats.outOfStock === 1 ? "product" : "products"}`}
                  secondary="These can't be ordered until stock is updated."
                />
              )}
            </ul>
          </div>
        </section>
      )}

      {/* ─── Recent orders + Quick links (two-column on lg+) ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <section className="lg:col-span-2 rounded-2xl bg-white border border-brand-blush shadow-petal-sm overflow-hidden">
          <header className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-brand-blush">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-brand-ink-muted font-bold">
                Activity
              </p>
              <h2 className="mt-0.5 text-base font-bold text-brand-ink">Recent orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
            >
              View all →
            </Link>
          </header>

          {stats.recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-blush/60 inline-flex items-center justify-center text-brand-pink-dark">
                <OrdersBoxIcon />
              </div>
              <p className="text-sm text-brand-ink-muted">No orders yet — share your store!</p>
            </div>
          ) : (
            <ul className="divide-y divide-brand-blush/60">
              {stats.recentOrders.map((o) => (
                <li key={o.orderId}>
                  <Link
                    href={`/admin/orders/${o.orderId}`}
                    className="group flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-brand-cream/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-bold text-brand-ink group-hover:text-brand-pink transition-colors">
                          {o.orderId}
                        </span>
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </div>
                      <p className="mt-0.5 text-sm text-brand-ink-muted truncate">{o.name}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-brand-ink tabular-nums">
                      {formatPrice(o.totalAmount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick links */}
        <section className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-brand-ink-muted font-bold">
            Shortcuts
          </p>
          <h2 className="mt-0.5 text-base font-bold text-brand-ink">Manage your shop</h2>
          <ul className="mt-4 space-y-2">
            <QuickLink href="/admin/products" label="Products" hint="Add, edit, restock" />
            <QuickLink href="/admin/categories" label="Categories" hint="Group your collection" />
            <QuickLink href="/admin/content/hero" label="Hero image" hint="What customers see first" />
            <QuickLink href="/admin/content/about" label="About page" hint="Your boutique story" />
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Layout primitives — local to keep the file self-contained.
   ────────────────────────────────────────────────────────────────────── */

function StatTile({
  icon,
  label,
  value,
  subtitle,
  tone,
  href,
  large,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle: string;
  tone: "default" | "ok" | "warn" | "alert";
  href: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl bg-white border shadow-petal-sm p-4 sm:p-5 cursor-pointer transition-all hover:shadow-petal-md hover:-translate-y-0.5 block",
        tone === "alert" && "border-red-200",
        tone === "warn" && "border-amber-200",
        tone === "ok" && "border-emerald-200",
        tone === "default" && "border-brand-blush"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-full",
            tone === "alert" && "bg-red-50 text-red-600",
            tone === "warn" && "bg-amber-50 text-amber-700",
            tone === "ok" && "bg-emerald-50 text-emerald-700",
            tone === "default" && "bg-brand-blush text-brand-pink-dark"
          )}
        >
          {icon}
        </span>
        <p className="text-[10px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold leading-tight">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-3 font-bold tabular-nums text-brand-ink leading-none",
          large ? "text-xl sm:text-2xl" : "text-3xl"
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] text-brand-ink-muted">{subtitle}</p>
    </Link>
  );
}

function ActionItem({
  href,
  primary,
  secondary,
}: {
  href: string;
  primary: string;
  secondary: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl p-3 sm:p-3.5 bg-white/10 hover:bg-white/15 cursor-pointer transition-colors"
      >
        <span className="h-9 w-9 shrink-0 rounded-full bg-white/15 inline-flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M3 7h8M7 3l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{primary}</p>
          <p className="text-xs text-white/75 truncate">{secondary}</p>
        </div>
        <span className="shrink-0 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M5 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

function QuickLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-brand-blush/40 cursor-pointer transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-ink group-hover:text-brand-pink transition-colors">
            {label}
          </p>
          <p className="text-[11px] text-brand-ink-muted">{hint}</p>
        </div>
        <span className="shrink-0 text-brand-pink group-hover:translate-x-0.5 transition-transform">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </li>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const tone =
    status === "Verification Pending"
      ? "warn"
      : status === "Paid"
        ? "ok"
        : status === "Rejected"
          ? "alert"
          : "neutral";
  const label =
    status === "Verification Pending" ? "Verify" : status === "Pending" ? "Awaiting" : status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap",
        tone === "alert" && "bg-red-50 text-red-600",
        tone === "warn" && "bg-amber-50 text-amber-700",
        tone === "ok" && "bg-emerald-50 text-emerald-700",
        tone === "neutral" && "bg-brand-cream text-brand-ink-muted"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "alert" && "bg-red-500",
          tone === "warn" && "bg-amber-500",
          tone === "ok" && "bg-emerald-500",
          tone === "neutral" && "bg-brand-ink-muted/60"
        )}
      />
      {label}
    </span>
  );
}

/* ───── Inline icons ──────────────────────────────────────────────────── */

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}

function FlowerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="7.5" r="3.25" />
      <circle cx="7.5" cy="12" r="3.25" />
      <circle cx="16.5" cy="12" r="3.25" />
      <circle cx="12" cy="16.5" r="3.25" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function OrdersBoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.3 7 12 12 20.7 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
