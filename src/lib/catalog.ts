import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { mapProductDoc, mapCategoryDoc } from "./mapProductDoc";
import type { Product, Category } from "@/types/product";
import type { ProductDoc, CategoryDoc } from "@/types/catalog";

async function productsCol() {
  return (await getDb()).collection<ProductDoc>("products");
}
async function categoriesCol() {
  return (await getDb()).collection<CategoryDoc>("categories");
}

export async function getAllProducts(): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col.find({}).sort({ featured: -1, createdAt: -1 }).toArray();
  return docs.map(mapProductDoc);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const col = await productsCol();
  const doc = await col.findOne({ slug });
  return doc ? mapProductDoc(doc) : undefined;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col
    .find({ category: slug })
    .sort({ featured: -1, createdAt: -1 })
    .toArray();
  return docs.map(mapProductDoc);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col.find({ featured: true }).sort({ createdAt: -1 }).toArray();
  return docs.map(mapProductDoc);
}

export async function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4
): Promise<Product[]> {
  const col = await productsCol();
  const docs = await col
    .find({ productId: { $ne: productId }, category })
    .limit(limit)
    .toArray();
  return docs.map(mapProductDoc);
}

export async function getAllCategories(): Promise<Category[]> {
  const col = await categoriesCol();
  const docs = await col.find({}).sort({ order: 1 }).toArray();
  return docs.map(mapCategoryDoc);
}

/** N newest categories by createdAt — used by the footer Shop column. */
export async function getRecentCategories(limit = 5): Promise<Category[]> {
  const col = await categoriesCol();
  const docs = await col
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(mapCategoryDoc);
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | undefined> {
  const col = await categoriesCol();
  const doc = await col.findOne({ slug });
  return doc ? mapCategoryDoc(doc) : undefined;
}

/** Server-only helper for `createOrder` so repriceCart stays sync + pure. */
export async function loadProductMap(): Promise<Map<string, Product>> {
  const all = await getAllProducts();
  return new Map(all.map((p) => [p.id, p]));
}

/** Internal helpers exported for admin actions (Tasks 21+24). */
export async function getProductDocById(
  hexId: string
): Promise<ProductDoc | null> {
  if (!ObjectId.isValid(hexId)) return null;
  const col = await productsCol();
  return col.findOne({ _id: new ObjectId(hexId) });
}
export async function getCategoryDocById(
  hexId: string
): Promise<CategoryDoc | null> {
  if (!ObjectId.isValid(hexId)) return null;
  const col = await categoriesCol();
  return col.findOne({ _id: new ObjectId(hexId) });
}
