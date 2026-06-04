import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderByOrderId } from "@/lib/orders";
import { AdminCard } from "@/components/admin/AdminCard";
import { formatPrice } from "@/lib/formatPrice";
import { OrderActions } from "@/components/admin/OrderActions";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export const metadata: Metadata = { title: "Admin · Order" };

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByOrderId(orderId);
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="space-y-6">
        <AdminBackLink href="/admin/orders" label="Orders" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-pink-dark font-bold">Order</p>
          <h1 className="text-2xl font-bold mt-1">{order.orderId}</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AdminCard title="Customer & Items">
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-brand-ink-muted">Name</dt><dd>{order.customer.name}</dd>
            <dt className="text-brand-ink-muted">Phone</dt><dd>{order.customer.phone}</dd>
            <dt className="text-brand-ink-muted">Address</dt>
            <dd className="break-words">
              {order.customer.addressLine1}
              {order.customer.addressLine2 ? <>, {order.customer.addressLine2}</> : null}
              <br />
              {order.customer.city}, {order.customer.state} — {order.customer.pincode}
            </dd>
            <dt className="text-brand-ink-muted">Created</dt>
            <dd>{new Date(order.createdAt).toLocaleString()}</dd>
          </dl>
          <ul className="mt-6 divide-y divide-brand-blush">
            {order.items.map((item) => (
              <li key={item.productId} className="py-3 flex gap-3">
                <div className="relative h-12 w-12 rounded overflow-hidden bg-brand-blush flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-brand-ink-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-brand-blush flex justify-between text-sm font-bold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </AdminCard>

        <AdminCard title="Payment">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold">
            Status — <span className="text-brand-pink-dark">{order.paymentStatus}</span>
          </p>
          {order.payment?.screenshotId && (
            <a
              href={`/api/admin/payments/${order.payment.screenshotId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4"
            >
              <Image
                src={`/api/admin/payments/${order.payment.screenshotId}`}
                alt="Payment screenshot"
                width={400}
                height={600}
                unoptimized
                className="rounded-xl border border-brand-blush max-h-96 w-auto object-contain"
              />
              <p className="mt-2 text-xs text-brand-pink cursor-pointer hover:underline">Open full size →</p>
            </a>
          )}
          {order.payment?.utr && (
            <p className="mt-3 text-sm">
              <span className="text-brand-ink-muted">UTR:</span>{" "}
              <span className="font-mono">{order.payment.utr}</span>
            </p>
          )}
          {order.verification?.notes && (
            <p className="mt-3 text-sm italic text-brand-ink-muted">&quot;{order.verification.notes}&quot;</p>
          )}
          <div className="mt-6">
            <OrderActions order={order} />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
