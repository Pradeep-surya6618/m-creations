import type { Metadata } from "next";
import Link from "next/link";
import { listOrdersForAdmin } from "@/lib/ordersAdmin";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Admin · Orders" };

const FILTERS = ["All", "Verify", "Paid", "Rejected", "Processing", "Shipped", "Delivered"] as const;
type FilterKey = (typeof FILTERS)[number];

function statusColor(s: string): string {
  if (s === "Verification Pending") return "text-brand-pink";
  if (s === "Paid") return "text-emerald-700";
  if (s === "Rejected") return "text-red-600";
  return "text-brand-ink-muted";
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = (FILTERS.includes(sp.filter as FilterKey) ? sp.filter : "All") as FilterKey;
  const dbFilter =
    filter === "All"
      ? "all"
      : filter === "Verify"
      ? "Verify"
      : (filter as "Paid" | "Rejected" | "Processing" | "Shipped" | "Delivered");
  const orders = await listOrdersForAdmin(dbFilter as Parameters<typeof listOrdersForAdmin>[0]);

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "All" ? "/admin/orders" : `/admin/orders?filter=${f}`}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] transition-all border cursor-pointer",
              filter === f
                ? "bg-brand-pink text-white border-brand-pink"
                : "bg-white text-brand-ink-muted border-brand-blush hover:bg-brand-cream"
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      <AdminCard>
        <AdminTable
          rows={orders}
          rowKey={(o) => o.orderId}
          emptyMessage="No orders match that filter."
          columns={[
            { key: "id", label: "Order", render: (o) => (
                <Link href={`/admin/orders/${o.orderId}`} className="font-semibold text-brand-ink hover:text-brand-pink cursor-pointer">
                  {o.orderId}
                </Link>
            )},
            { key: "customer", label: "Customer", render: (o) => o.customer.name },
            { key: "items", label: "Items", render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
            { key: "total", label: "Total", render: (o) => formatPrice(o.totalAmount), className: "tabular-nums" },
            { key: "status", label: "Status", render: (o) => (
                <span className={cn("text-xs font-bold uppercase tracking-wide", statusColor(o.paymentStatus))}>
                  {o.paymentStatus}
                </span>
            )},
            { key: "date", label: "Created", render: (o) => new Date(o.createdAt).toLocaleDateString() },
          ]}
        />
      </AdminCard>
    </div>
  );
}
