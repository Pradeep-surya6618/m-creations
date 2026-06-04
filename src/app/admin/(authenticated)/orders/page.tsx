import type { Metadata } from "next";
import Link from "next/link";
import { listOrdersForAdmin } from "@/lib/ordersAdmin";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";
import type { OrderRecord, PaymentStatus } from "@/types/order";

export const metadata: Metadata = { title: "Admin · Orders" };

const FILTERS = ["All", "Verify", "Paid", "Rejected", "Processing", "Shipped", "Delivered"] as const;
type FilterKey = (typeof FILTERS)[number];

function matchesFilter(o: OrderRecord, f: FilterKey): boolean {
  if (f === "All") return true;
  if (f === "Verify") return o.paymentStatus === "Verification Pending";
  if (f === "Paid" || f === "Rejected") return o.paymentStatus === f;
  return o.orderStatus === f;
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = (FILTERS.includes(sp.filter as FilterKey) ? sp.filter : "All") as FilterKey;

  // Fetch the full set once so the stat strip + filter chips can show live
  // counts without a separate round-trip per status.
  const allOrders = await listOrdersForAdmin("all");
  const filtered = allOrders.filter((o) => matchesFilter(o, filter));

  const totalCount = allOrders.length;
  const pendingVerify = allOrders.filter((o) => o.paymentStatus === "Verification Pending").length;
  const paidCount = allOrders.filter((o) => o.paymentStatus === "Paid").length;
  const isFiltered = filter !== "All";

  return (
    <div className="space-y-6 w-full">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-brand-pink-dark font-bold">
            Operations
          </p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-brand-ink">Orders</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-blush text-brand-pink-dark text-xs font-bold tabular-nums">
              {totalCount}
            </span>
          </div>
          {pendingVerify > 0 && (
            <p className="mt-1.5 text-xs text-brand-pink-dark font-semibold">
              {pendingVerify} {pendingVerify === 1 ? "order needs" : "orders need"} payment verification.
            </p>
          )}
        </div>
      </header>

      {/* ─── Stat strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill labelLong="Total" labelShort="Total" value={totalCount} tone="default" />
        <StatPill labelLong="Verify" labelShort="Verify" value={pendingVerify} tone={pendingVerify > 0 ? "alert" : "default"} />
        <StatPill labelLong="Paid" labelShort="Paid" value={paidCount} tone={paidCount > 0 ? "ok" : "default"} />
      </div>

      {/* ─── Filter tabs ───────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm p-3 sm:p-4">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const count = allOrders.filter((o) => matchesFilter(o, f)).length;
            const active = filter === f;
            return (
              <Link
                key={f}
                href={f === "All" ? "/admin/orders" : `/admin/orders?filter=${f}`}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer",
                  active
                    ? "bg-brand-gradient text-white shadow-petal-sm"
                    : "bg-brand-cream/40 text-brand-ink-muted hover:bg-brand-blush/50 hover:text-brand-pink-dark"
                )}
              >
                {f}
                <span
                  className={cn(
                    "tabular-nums text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                    active
                      ? "bg-white/25 text-white"
                      : f === "Verify" && count > 0
                        ? "bg-brand-pink text-white"
                        : "bg-white border border-brand-blush text-brand-ink-muted"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Table card ────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm overflow-hidden">
        <header className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-brand-blush">
          <p className="text-[11px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold">
            {isFiltered ? `${filtered.length} of ${totalCount}` : `${totalCount} total`}
          </p>
          {isFiltered && (
            <Link
              href="/admin/orders"
              className="text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
            >
              Clear filter →
            </Link>
          )}
        </header>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-blush/60 inline-flex items-center justify-center text-brand-pink-dark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.3 7 12 12 20.7 7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            </div>
            <p className="text-sm text-brand-ink-muted">No orders match that filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-brand-ink-muted">
                <tr className="border-b border-brand-blush">
                  <th className="py-3 px-5 sm:px-6 font-bold w-[28%]">Order</th>
                  <th className="py-3 px-3 font-bold w-[24%]">Customer</th>
                  <th className="py-3 px-3 font-bold text-center">Items</th>
                  <th className="py-3 px-3 font-bold text-right">Total</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-3 font-bold">Created</th>
                  <th className="py-3 px-5 sm:px-6 font-bold w-[1%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blush/60">
                {filtered.map((o) => (
                  <tr key={o.orderId} className="group hover:bg-brand-cream/50 transition-colors">
                    <td className="py-3 px-5 sm:px-6">
                      <Link
                        href={`/admin/orders/${o.orderId}`}
                        className="font-mono text-[13px] font-bold text-brand-ink group-hover:text-brand-pink transition-colors cursor-pointer"
                      >
                        {o.orderId}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-brand-ink truncate">{o.customer.name}</p>
                      <p className="text-[11px] text-brand-ink-muted truncate">{o.customer.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-center text-brand-ink-muted tabular-nums">
                      {o.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-brand-ink tabular-nums">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusPill paymentStatus={o.paymentStatus} orderStatus={o.orderStatus} />
                    </td>
                    <td className="py-3 px-3 text-xs text-brand-ink-muted whitespace-nowrap">
                      {formatRelativeDate(o.createdAt)}
                    </td>
                    <td className="py-3 px-5 sm:px-6 text-right">
                      <Link
                        href={`/admin/orders/${o.orderId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
                      >
                        View
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                          <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="md:hidden divide-y divide-brand-blush/60">
              {filtered.map((o) => (
                <li key={o.orderId}>
                  <Link
                    href={`/admin/orders/${o.orderId}`}
                    className="flex flex-col gap-2 px-3 py-3 active:bg-brand-cream/60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[12px] font-bold text-brand-ink truncate">
                        {o.orderId}
                      </p>
                      <StatusPill paymentStatus={o.paymentStatus} orderStatus={o.orderStatus} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-ink truncate">{o.customer.name}</p>
                        <p className="text-[11px] text-brand-ink-muted">
                          {o.items.reduce((s, i) => s + i.quantity, 0)} {o.items.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"} · {formatRelativeDate(o.createdAt)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-brand-ink tabular-nums">
                        {formatPrice(o.totalAmount)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Local presentational helpers.
   ────────────────────────────────────────────────────────────────────── */

function StatPill({
  labelLong,
  labelShort,
  value,
  tone,
}: {
  labelLong: string;
  labelShort: string;
  value: number;
  tone: "default" | "alert" | "ok";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3 shadow-petal-sm transition-shadow",
        tone === "alert" && "border-red-200",
        tone === "ok" && "border-emerald-200",
        tone === "default" && "border-brand-blush"
      )}
    >
      <span
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 shrink-0 inline-flex items-center justify-center rounded-full text-sm font-bold tabular-nums",
          tone === "alert" && "bg-red-50 text-red-600",
          tone === "ok" && "bg-emerald-50 text-emerald-700",
          tone === "default" && "bg-brand-blush text-brand-pink-dark"
        )}
      >
        {value}
      </span>
      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold leading-tight">
        <span className="sm:hidden">{labelShort}</span>
        <span className="hidden sm:inline">{labelLong}</span>
      </span>
    </div>
  );
}

function StatusPill({
  paymentStatus,
  orderStatus,
}: {
  paymentStatus: PaymentStatus;
  orderStatus: OrderRecord["orderStatus"];
}) {
  // Payment status takes precedence — once Paid, surface the fulfilment state.
  const { label, tone } = ((): { label: string; tone: "alert" | "warn" | "ok" | "info" | "neutral" } => {
    if (paymentStatus === "Verification Pending") return { label: "Verify", tone: "warn" };
    if (paymentStatus === "Rejected") return { label: "Rejected", tone: "alert" };
    if (paymentStatus === "Pending") return { label: "Awaiting", tone: "neutral" };
    // Paid — show the fulfilment stage.
    if (orderStatus === "Delivered") return { label: "Delivered", tone: "ok" };
    if (orderStatus === "Shipped") return { label: "Shipped", tone: "info" };
    if (orderStatus === "Processing") return { label: "Processing", tone: "info" };
    return { label: "Paid", tone: "ok" };
  })();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
        tone === "alert" && "bg-red-50 text-red-600",
        tone === "warn" && "bg-amber-50 text-amber-700",
        tone === "ok" && "bg-emerald-50 text-emerald-700",
        tone === "info" && "bg-sky-50 text-sky-700",
        tone === "neutral" && "bg-brand-cream text-brand-ink-muted"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "alert" && "bg-red-500",
          tone === "warn" && "bg-amber-500",
          tone === "ok" && "bg-emerald-500",
          tone === "info" && "bg-sky-500",
          tone === "neutral" && "bg-brand-ink-muted/60"
        )}
      />
      {label}
    </span>
  );
}

/**
 * Compact "5h ago" / "3d ago" / "12 Apr" depending on how long ago the order
 * was placed. Falls back to a locale date once the order is older than a week.
 */
function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
