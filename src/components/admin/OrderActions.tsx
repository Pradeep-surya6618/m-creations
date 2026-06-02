"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  markPaymentPaid,
  markPaymentRejected,
  advanceOrderStatus,
  revertOrderStatus,
} from "@/actions/orderAdmin";
import { AdminButton } from "./AdminButton";
import {
  canAdvanceOrder,
  canRevertOrder,
  nextOrderStatus,
  prevOrderStatus,
} from "@/lib/orderTransitions";
import type { OrderRecord, OrderStatus } from "@/types/order";

type Props = { order: OrderRecord };

export function OrderActions({ order }: Props) {
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  const verifyShow = order.paymentStatus === "Verification Pending";

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, successMsg: string) => {
    start(async () => {
      const res = await fn();
      if (res.ok) toast.success(successMsg);
      else toast.error(res.error);
    });
  };

  return (
    <div className="space-y-6">
      {verifyShow && (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional verification notes…"
            className="w-full rounded-xl border border-brand-blush bg-white p-3 text-sm"
            rows={3}
          />
          <div className="flex gap-2">
            <AdminButton
              variant="primary"
              disabled={pending}
              onClick={() => run(() => markPaymentPaid(order.orderId, notes || undefined), "Marked Paid")}
            >
              Mark Paid
            </AdminButton>
            <AdminButton
              variant="danger"
              disabled={pending}
              onClick={() => run(() => markPaymentRejected(order.orderId, notes || undefined), "Marked Rejected")}
            >
              Mark Rejected
            </AdminButton>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-brand-blush">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold mb-3">
          Order Status — {order.orderStatus}
        </p>
        <div className="flex gap-2">
          {canRevertOrder(order.orderStatus as OrderStatus) && (
            <AdminButton
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => run(() => revertOrderStatus(order.orderId), `Reverted to ${prevOrderStatus(order.orderStatus as OrderStatus)}`)}
            >
              ← Revert
            </AdminButton>
          )}
          {canAdvanceOrder(order.orderStatus as OrderStatus) && (
            <AdminButton
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={() => run(() => advanceOrderStatus(order.orderId), `Advanced to ${nextOrderStatus(order.orderStatus as OrderStatus)}`)}
            >
              Advance to {nextOrderStatus(order.orderStatus as OrderStatus)} →
            </AdminButton>
          )}
        </div>
      </div>
    </div>
  );
}
