import type { Product, CategorySlug } from "@/types/product";

const KNOWN_CATEGORIES = new Set<CategorySlug>([
  "bouquets",
  "pipe-cleaner",
  "flower-pots",
  "gifts",
  "candle-floral",
]);

export function filterProducts(
  products: Product[],
  category?: string | "all"
): Product[] {
  if (!category || category === "all") return products;
  if (!KNOWN_CATEGORIES.has(category as CategorySlug)) return [];
  return products.filter((p) => p.category === category);
}
