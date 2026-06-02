import type { Product, Category } from "@/types/product";
import type { ProductDoc, CategoryDoc } from "@/types/catalog";

export function mapProductDoc(doc: ProductDoc): Product {
  return {
    id: doc.productId,
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    price: doc.price,
    images: doc.images.map((id) => `/api/images/${id.toHexString()}`),
    shortDescription: doc.shortDescription,
    handmadeDetails: doc.handmadeDetails,
    stock: doc.stock,
    featured: doc.featured || undefined,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function mapCategoryDoc(doc: CategoryDoc): Category {
  return {
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    image: doc.image ? `/api/images/${doc.image.toHexString()}` : "",
  };
}
