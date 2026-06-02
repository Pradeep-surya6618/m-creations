import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { ObjectId } from "mongodb";

async function main() {
  const wantSeed = process.argv.includes("--seed");
  if (!wantSeed) {
    console.log(
      "scripts/seedCatalog.ts: pass --seed to populate categories + products. Skipping."
    );
    return;
  }

  const { getDb } = await import("../src/lib/mongodb");
  const db = await getDb();

  // === Seed categories ===
  const categories = [
    { slug: "bouquets", name: "Handmade Bouquets",
      description: "Hand-tied bouquets crafted from pipe cleaner roses, lilies, and seasonal blooms.", order: 0 },
    { slug: "pipe-cleaner", name: "Pipe Cleaner Flowers",
      description: "Single-stem and small-cluster pipe cleaner flowers, perfect for gifting.", order: 1 },
    { slug: "flower-pots", name: "Decorative Flower Pots",
      description: "Miniature pots arranged with handmade blooms — a cheerful piece of forever-spring.", order: 2 },
    { slug: "gifts", name: "Floral Gifts",
      description: "Curated gift sets for birthdays, anniversaries, and just-because moments.", order: 3 },
    { slug: "candle-floral", name: "Candle Flower Designs",
      description: "Scented candles wrapped in handmade petals — a softer kind of glow.", order: 4 },
  ];
  for (const c of categories) {
    await db.collection("categories").updateOne(
      { slug: c.slug },
      {
        $setOnInsert: { ...c, image: null, createdAt: new Date(), updatedAt: new Date() },
      },
      { upsert: true }
    );
  }

  // === Seed products (no image references — admin re-uploads) ===
  const products: Array<{
    productId: string; slug: string; name: string; category: string;
    price: number; shortDescription: string; handmadeDetails: string[];
    stock: number; featured: boolean;
  }> = [
    { productId: "mc-p-001", slug: "rose-garden-bouquet", name: "Rose Garden Bouquet", category: "bouquets",
      price: 499, shortDescription: "A dozen handmade pipe-cleaner roses tied with satin ribbon.",
      handmadeDetails: ["12 pipe-cleaner roses in soft pinks", "Satin ribbon wrap, hand-tied", "Approx. 28cm tall · 18cm wide"],
      stock: 8, featured: true },
    { productId: "mc-p-002", slug: "blush-lily-bouquet", name: "Blush Lily Bouquet", category: "bouquets",
      price: 649, shortDescription: "Hand-shaped lilies in blush and ivory, gathered with kraft paper.",
      handmadeDetails: ["9 hand-shaped lilies", "Kraft paper wrap with twine", "Approx. 32cm tall"],
      stock: 5, featured: true },
    { productId: "mc-p-003", slug: "spring-meadow-bouquet", name: "Spring Meadow Bouquet", category: "bouquets",
      price: 899, shortDescription: "A wildflower-style mix of pipe cleaner blooms in soft pastels.",
      handmadeDetails: ["Mixed-bloom arrangement", "Pastel palette: blush, mint, butter", "Hand-tied with lace ribbon"],
      stock: 3, featured: false },
    { productId: "mc-p-004", slug: "single-stem-rose", name: "Single-Stem Rose", category: "pipe-cleaner",
      price: 99, shortDescription: "A single handcrafted pipe-cleaner rose — the perfect little gift.",
      handmadeDetails: ["Hand-shaped petals", "Approx. 22cm stem", "Choice of pink, red, or ivory (specify on order)"],
      stock: 24, featured: false },
    { productId: "mc-p-005", slug: "trio-of-tulips", name: "Trio of Tulips", category: "pipe-cleaner",
      price: 249, shortDescription: "Three handcrafted tulips, tied together with a delicate ribbon.",
      handmadeDetails: ["Three pipe-cleaner tulips", "Pastel colour mix", "Ribbon wrap"],
      stock: 12, featured: true },
    { productId: "mc-p-006", slug: "cottage-bloom-pot", name: "Cottage Bloom Pot", category: "flower-pots",
      price: 899, shortDescription: "A miniature ceramic pot brimming with handmade flowers.",
      handmadeDetails: ["Ceramic pot · approx. 10cm diameter", "Mixed pipe-cleaner blooms", "Ready to display"],
      stock: 4, featured: false },
    { productId: "mc-p-007", slug: "tiny-terrace-planter", name: "Tiny Terrace Planter", category: "flower-pots",
      price: 599, shortDescription: "A petite planter perfect for desks and bedside tables.",
      handmadeDetails: ["Hand-painted terracotta pot", "3 pipe-cleaner blooms", "Wipe-clean, no watering needed"],
      stock: 7, featured: false },
    { productId: "mc-p-008", slug: "love-note-gift-box", name: "Love Note Gift Box", category: "gifts",
      price: 749, shortDescription: "A gift box with a mini bouquet and handwritten love note.",
      handmadeDetails: ["Mini bouquet of 5 stems", "Handwritten note (specify wording on order)", "Branded gift box"],
      stock: 6, featured: true },
    { productId: "mc-p-009", slug: "anniversary-keepsake-set", name: "Anniversary Keepsake Set", category: "gifts",
      price: 1299, shortDescription: "A keepsake bouquet paired with a candle floral piece.",
      handmadeDetails: ["Handmade bouquet of 7 stems", "Matching candle floral piece", "Gift-ready presentation"],
      stock: 3, featured: false },
    { productId: "mc-p-010", slug: "birthday-blooms-set", name: "Birthday Blooms Set", category: "gifts",
      price: 599, shortDescription: "A bright handmade bouquet with a birthday tag.",
      handmadeDetails: ["Mixed-bloom mini bouquet", "Birthday card included", "Bright cheerful palette"],
      stock: 9, featured: false },
    { productId: "mc-p-011", slug: "pink-petal-candle", name: "Pink Petal Candle", category: "candle-floral",
      price: 699, shortDescription: "A scented candle wrapped in handmade rose petals.",
      handmadeDetails: ["Soy wax · rose scent", "Hand-shaped petal wrap", "Approx. 8cm tall"], stock: 5, featured: false },
    { productId: "mc-p-012", slug: "blush-glow-candle", name: "Blush Glow Candle", category: "candle-floral",
      price: 849, shortDescription: "A larger candle with a halo of handmade pink blooms.",
      handmadeDetails: ["Soy wax · jasmine scent", "Bloom halo arrangement", "Approx. 12cm tall"], stock: 0, featured: false },
  ];

  const now = new Date();
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

  // === Indexes ===
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("products").createIndex({ productId: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1 });
  await db.collection("products").createIndex({ featured: -1, createdAt: -1 });
  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("categories").createIndex({ order: 1 });
  await db.collection("images").createIndex({ createdAt: -1 });

  console.log("Catalog seeded + indexes created.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
