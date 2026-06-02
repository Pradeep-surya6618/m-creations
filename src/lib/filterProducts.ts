import type { Product } from "@/types/product";

export function filterProducts(
  products: Product[],
  category?: string | "all"
): Product[] {
  if (!category || category === "all") return products;
  return products.filter((p) => p.category === category);
}
