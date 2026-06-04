// Wipe the orders + payments collections so the admin panel can be
// tested from a clean slate. Leaves products, categories, content,
// and product images alone.
//
// Usage:   npx tsx scripts/clearOrders.ts --force
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

async function main() {
  const wantClear = process.argv.includes("--force");
  if (!wantClear) {
    console.log(
      "scripts/clearOrders.ts: pass --force to wipe orders + payment screenshots. Skipping."
    );
    return;
  }

  const { getDb } = await import("../src/lib/mongodb");
  const db = await getDb();

  const beforeOrders = await db.collection("orders").countDocuments();
  const beforePayments = await db.collection("payments").countDocuments();
  console.log(`Before:  ${beforeOrders} orders · ${beforePayments} payment screenshots`);

  const ordersRes = await db.collection("orders").deleteMany({});
  const paymentsRes = await db.collection("payments").deleteMany({});
  console.log(
    `Deleted: ${ordersRes.deletedCount} orders · ${paymentsRes.deletedCount} payment screenshots`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
