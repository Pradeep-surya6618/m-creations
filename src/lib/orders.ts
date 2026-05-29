import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { CustomerInfo, OrderItem, OrderRecord } from "@/types/order";

type OrderDoc = Omit<OrderRecord, "createdAt" | "updatedAt" | "payment"> & {
  createdAt: Date;
  updatedAt: Date;
  payment?: { screenshotId: ObjectId; utr?: string; uploadedAt: Date };
};

async function collection() {
  const db = await getDb();
  return db.collection<OrderDoc>("orders");
}

export async function createOrderDoc(input: {
  orderId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
}): Promise<void> {
  const col = await collection();
  const now = new Date();
  await col.insertOne({
    orderId: input.orderId,
    customer: input.customer,
    items: input.items,
    totalAmount: input.totalAmount,
    paymentStatus: "Pending",
    orderStatus: "Pending",
    createdAt: now,
    updatedAt: now,
  });
}

function toRecord(doc: OrderDoc): OrderRecord {
  return {
    orderId: doc.orderId,
    customer: doc.customer,
    items: doc.items,
    totalAmount: doc.totalAmount,
    paymentStatus: doc.paymentStatus,
    orderStatus: doc.orderStatus,
    payment: doc.payment
      ? {
          screenshotId: doc.payment.screenshotId.toHexString(),
          utr: doc.payment.utr,
          uploadedAt: doc.payment.uploadedAt.toISOString(),
        }
      : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getOrderByOrderId(orderId: string): Promise<OrderRecord | null> {
  const col = await collection();
  const doc = await col.findOne({ orderId });
  return doc ? toRecord(doc) : null;
}

export async function markPaymentUploaded(args: {
  orderId: string;
  screenshotId: ObjectId;
  utr?: string;
}): Promise<void> {
  const col = await collection();
  const now = new Date();
  await col.updateOne(
    { orderId: args.orderId },
    {
      $set: {
        payment: { screenshotId: args.screenshotId, utr: args.utr, uploadedAt: now },
        paymentStatus: "Verification Pending",
        updatedAt: now,
      },
    }
  );
}
