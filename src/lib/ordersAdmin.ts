import { getDb } from "./mongodb";
import type { OrderRecord, PaymentStatus } from "@/types/order";

export async function listOrdersForAdmin(
  filter?: PaymentStatus | "all" | "Verify"
): Promise<OrderRecord[]> {
  const db = await getDb();
  const q: Record<string, unknown> = {};
  if (filter && filter !== "all") {
    q.paymentStatus = filter === "Verify" ? "Verification Pending" : filter;
  }
  const docs = await db.collection("orders").find(q).sort({ createdAt: -1 }).limit(200).toArray();
  return docs.map(
    (d): OrderRecord => ({
      orderId: d.orderId,
      customer: d.customer,
      items: d.items,
      totalAmount: d.totalAmount,
      paymentStatus: d.paymentStatus,
      orderStatus: d.orderStatus,
      payment: d.payment
        ? {
            screenshotId: d.payment.screenshotId.toHexString?.() ?? String(d.payment.screenshotId),
            utr: d.payment.utr,
            uploadedAt: (d.payment.uploadedAt as Date).toISOString(),
          }
        : undefined,
      verification: d.verification
        ? {
            verifiedAt: d.verification.verifiedAt?.toISOString?.(),
            rejectedAt: d.verification.rejectedAt?.toISOString?.(),
            notes: d.verification.notes,
          }
        : undefined,
      createdAt: (d.createdAt as Date).toISOString(),
      updatedAt: (d.updatedAt as Date).toISOString(),
    })
  );
}
