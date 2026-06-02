import { getDb } from "./mongodb";

export type DashboardStats = {
  pendingVerification: number;
  paidThisWeek: number;
  productsLive: number;
  outOfStock: number;
  recentOrders: Array<{
    orderId: string;
    name: string;
    totalAmount: number;
    paymentStatus: string;
    createdAt: string;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [pending, paidWeek, products, oos, recent] = await Promise.all([
    db.collection("orders").countDocuments({ paymentStatus: "Verification Pending" }),
    db.collection("orders").countDocuments({
      paymentStatus: "Paid",
      "verification.verifiedAt": { $gte: weekAgo },
    }),
    db.collection("products").countDocuments({}),
    db.collection("products").countDocuments({ stock: { $lte: 0 } }),
    db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
  ]);

  return {
    pendingVerification: pending,
    paidThisWeek: paidWeek,
    productsLive: products,
    outOfStock: oos,
    recentOrders: recent.map((o) => ({
      orderId: o.orderId,
      name: o.customer?.name ?? "—",
      totalAmount: o.totalAmount ?? 0,
      paymentStatus: o.paymentStatus ?? "Pending",
      createdAt: (o.createdAt as Date)?.toISOString() ?? "",
    })),
  };
}
