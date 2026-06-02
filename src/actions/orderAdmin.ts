"use server";

import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/adminSession";
import {
  canTransitionPayment,
  canAdvanceOrder,
  canRevertOrder,
  nextOrderStatus,
  prevOrderStatus,
} from "@/lib/orderTransitions";
import type { PaymentStatus, OrderStatus } from "@/types/order";

type Result = { ok: true } | { ok: false; error: string };

async function loadOrder(orderId: string) {
  const db = await getDb();
  return db.collection("orders").findOne({ orderId });
}

async function setPayment(orderId: string, to: PaymentStatus, notes?: string): Promise<Result> {
  await requireAdminSession();
  const o = await loadOrder(orderId);
  if (!o) return { ok: false, error: "Order not found." };
  if (!canTransitionPayment(o.paymentStatus, to)) {
    return { ok: false, error: `Cannot change payment from ${o.paymentStatus} to ${to}.` };
  }
  const db = await getDb();
  const now = new Date();
  const verificationField = to === "Paid"
    ? { verifiedAt: now, notes }
    : { rejectedAt: now, notes };
  await db.collection("orders").updateOne(
    { orderId },
    {
      $set: {
        paymentStatus: to,
        verification: { ...(o.verification ?? {}), ...verificationField },
        updatedAt: now,
      },
    }
  );
  return { ok: true };
}

export async function markPaymentPaid(orderId: string, notes?: string) {
  return setPayment(orderId, "Paid", notes);
}
export async function markPaymentRejected(orderId: string, notes?: string) {
  return setPayment(orderId, "Rejected", notes);
}

async function moveStatus(
  orderId: string,
  direction: "advance" | "revert"
): Promise<Result> {
  await requireAdminSession();
  const o = await loadOrder(orderId);
  if (!o) return { ok: false, error: "Order not found." };
  const from = o.orderStatus as OrderStatus;
  const allowed = direction === "advance" ? canAdvanceOrder(from) : canRevertOrder(from);
  if (!allowed) return { ok: false, error: "Cannot change status." };
  const to = direction === "advance" ? nextOrderStatus(from) : prevOrderStatus(from);
  if (!to) return { ok: false, error: "No further transition." };
  const db = await getDb();
  await db.collection("orders").updateOne(
    { orderId },
    { $set: { orderStatus: to, updatedAt: new Date() } }
  );
  return { ok: true };
}

export async function advanceOrderStatus(orderId: string) { return moveStatus(orderId, "advance"); }
export async function revertOrderStatus(orderId: string)  { return moveStatus(orderId, "revert"); }
