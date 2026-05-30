import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { getDb } = await import("../src/lib/mongodb");
  const db = await getDb();
  await db.collection("orders").createIndex({ orderId: 1 }, { unique: true });
  await db.collection("orders").createIndex({ createdAt: -1 });
  await db.collection("payments").createIndex({ orderId: 1 });
  console.log("Indexes created.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
