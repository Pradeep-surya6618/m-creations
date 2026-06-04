// Wipe the products + categories collections so the admin panel can be
// tested from a clean slate. Leaves orders, content (hero/about), and
// the image binaries alone — those are independent and may still be
// useful for testing other flows.
//
// Usage:   npx tsx scripts/clearCatalog.ts --force
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

async function main() {
  const wantClear = process.argv.includes("--force");
  if (!wantClear) {
    console.log(
      "scripts/clearCatalog.ts: pass --force to wipe products + categories. Skipping."
    );
    return;
  }

  const { getDb } = await import("../src/lib/mongodb");
  const db = await getDb();

  const beforeProducts = await db.collection("products").countDocuments();
  const beforeCategories = await db.collection("categories").countDocuments();

  console.log(`Before:  ${beforeProducts} products · ${beforeCategories} categories`);

  const productsRes = await db.collection("products").deleteMany({});
  const categoriesRes = await db.collection("categories").deleteMany({});

  console.log(
    `Deleted: ${productsRes.deletedCount} products · ${categoriesRes.deletedCount} categories`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
