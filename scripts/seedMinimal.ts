// Minimal seed for manual browser testing — 2 categories + 2 products
// (both featured + in stock so they show on the home page and shop list).
// Products are inserted with no images; upload images via the admin UI
// when you want them to show on the storefront.
//
// Usage:   npx tsx scripts/seedMinimal.ts
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { ObjectId } from "mongodb";

async function main() {
  const { getDb } = await import("../src/lib/mongodb");
  const db = await getDb();

  const now = new Date();

  // === Categories ===
  const categories = [
    {
      slug: "bouquets",
      name: "Handmade Bouquets",
      description:
        "Hand-tied bouquets crafted from pipe cleaner roses, lilies, and seasonal blooms.",
      order: 0,
    },
    {
      slug: "gifts",
      name: "Floral Gifts",
      description:
        "Curated gift sets for birthdays, anniversaries, and just-because moments.",
      order: 1,
    },
  ];

  for (const c of categories) {
    await db.collection("categories").updateOne(
      { slug: c.slug },
      {
        $setOnInsert: { ...c, image: null, createdAt: now, updatedAt: now },
      },
      { upsert: true }
    );
  }

  // === Products ===
  const products = [
    {
      productId: "mc-p-001",
      slug: "rose-garden-bouquet",
      name: "Rose Garden Bouquet",
      category: "bouquets",
      price: 499,
      stock: 8,
      featured: true,
      shortDescription:
        "A dozen handmade pipe-cleaner roses tied with satin ribbon.",
      handmadeDetails: [
        "12 pipe-cleaner roses in soft pinks",
        "Satin ribbon wrap, hand-tied",
        "Approx. 28cm tall · 18cm wide",
      ],
    },
    {
      productId: "mc-p-002",
      slug: "love-note-gift-box",
      name: "Love Note Gift Box",
      category: "gifts",
      price: 749,
      stock: 6,
      featured: true,
      shortDescription:
        "A gift box with a mini bouquet and a handwritten love note.",
      handmadeDetails: [
        "Mini bouquet of 5 stems",
        "Handwritten note (specify wording on order)",
        "Branded gift box",
      ],
    },
  ];

  for (const p of products) {
    await db.collection("products").updateOne(
      { productId: p.productId },
      {
        $setOnInsert: {
          ...p,
          images: [] as ObjectId[],
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
  }

  const catCount = await db.collection("categories").countDocuments();
  const prodCount = await db.collection("products").countDocuments();
  console.log(`Seeded.  Now have ${catCount} categories · ${prodCount} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
