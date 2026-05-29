import { Binary, ObjectId } from "mongodb";
import { getDb } from "./mongodb";

type PaymentDoc = {
  _id: ObjectId;
  orderId: string;
  data: Binary;
  contentType: string;
  size: number;
  uploadedAt: Date;
};

async function collection() {
  const db = await getDb();
  return db.collection<PaymentDoc>("payments");
}

export async function savePaymentScreenshot(args: {
  orderId: string;
  bytes: Buffer;
  contentType: string;
}): Promise<ObjectId> {
  const col = await collection();
  const _id = new ObjectId();
  await col.insertOne({
    _id,
    orderId: args.orderId,
    data: new Binary(args.bytes),
    contentType: args.contentType,
    size: args.bytes.length,
    uploadedAt: new Date(),
  });
  return _id;
}

export async function getPaymentById(
  id: string
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await collection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { bytes: Buffer.from(doc.data.buffer), contentType: doc.contentType };
}
