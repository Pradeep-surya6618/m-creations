import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboardStats";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { formatPrice } from "@/lib/formatPrice";

export const metadata: Metadata = { title: "Admin · Dashboard" };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const tiles = [
    { label: "Pending Verification", value: stats.pendingVerification, alert: stats.pendingVerification > 0 },
    { label: "Paid This Week", value: stats.paidThisWeek },
    { label: "Products Live", value: stats.productsLive },
    { label: "Out of Stock", value: stats.outOfStock, alert: stats.outOfStock > 0 },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-ink">Dashboard</h1>
        <div className="flex gap-2">
          <AdminButton href="/admin/products/new" variant="primary" size="sm">+ Product</AdminButton>
          <AdminButton href="/admin/categories/new" variant="secondary" size="sm">+ Category</AdminButton>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <AdminCard key={t.label} className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold">{t.label}</p>
            <p className={`mt-2 text-3xl font-bold ${t.alert ? "text-brand-pink" : "text-brand-ink"}`}>{t.value}</p>
          </AdminCard>
        ))}
      </div>

      <AdminCard title="Recent Orders">
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-brand-ink-muted py-8 text-center">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-brand-blush">
            {stats.recentOrders.map((o) => (
              <li key={o.orderId}>
                <Link
                  href={`/admin/orders/${o.orderId}`}
                  className="flex items-center justify-between py-3 px-1 text-sm hover:bg-brand-cream transition-colors rounded cursor-pointer"
                >
                  <span className="font-semibold text-brand-ink">{o.orderId}</span>
                  <span className="text-brand-ink-muted truncate flex-1 px-3">{o.name}</span>
                  <span className="text-xs text-brand-pink-dark uppercase tracking-wide mr-3">
                    {o.paymentStatus}
                  </span>
                  <span className="font-semibold text-brand-ink">{formatPrice(o.totalAmount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
