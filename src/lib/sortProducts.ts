import type { Product } from "@/types/product";

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const byCreatedAtDesc = (a: Product, b: Product) =>
  b.createdAt.localeCompare(a.createdAt);

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy.sort(byCreatedAtDesc);
    case "featured":
    default:
      return copy.sort((a, b) => {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        return byCreatedAtDesc(a, b);
      });
  }
}
