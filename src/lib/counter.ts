import { getDb } from "./mongodb";
import { formatOrderId } from "./formatOrderId";

/**
 * Atomically increments the order sequence and returns the formatted
 * order id (MC1001, MC1002, ...). Upsert + $inc means the first call
 * returns seq=1 -> "MC1001". Concurrency-safe.
 */
export async function nextOrderId(): Promise<string> {
  const db = await getDb();
  const result = await db
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate(
      { _id: "orderId" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  const seq = result?.seq ?? 1;
  return formatOrderId(seq);
}
