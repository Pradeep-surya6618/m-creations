"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/adminSession";
import { productSchema } from "@/lib/validation/product";
import type { ProductDoc } from "@/types/catalog";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function generateProductId(): string {
  // mc-p-XXX based on a 6-digit timestamp tail. Not collision-proof for
  // parallel admin creates (which don't happen at one-admin scale).
  const tail = Date.now().toString().slice(-6);
  return `mc-p-${tail}`;
}

async function uniqueSlugCheck(slug: string, excludeId?: string): Promise<boolean> {
  const db = await getDb();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }
  const existing = await db.collection<ProductDoc>("products").findOne(filter);
  return !existing;
}

export async function createProduct(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  if (!(await uniqueSlugCheck(parsed.data.slug))) {
    return { ok: false, error: "A product with that slug already exists." };
  }
  const db = await getDb();
  const now = new Date();
  const _id = new ObjectId();
  await db.collection<ProductDoc>("products").insertOne({
    _id,
    productId: generateProductId(),
    slug: parsed.data.slug,
    name: parsed.data.name,
    category: parsed.data.category,
    price: parsed.data.price,
    stock: parsed.data.stock,
    featured: parsed.data.featured,
    shortDescription: parsed.data.shortDescription,
    handmadeDetails: parsed.data.handmadeDetails,
    images: parsed.data.images.map((hex) => new ObjectId(hex)),
    createdAt: now,
    updatedAt: now,
  });
  return { ok: true, id: _id.toHexString() };
}

export async function updateProduct(id: string, input: unknown): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid product id." };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  const db = await getDb();
  // Slug immutable post-create — ignore any client-sent slug change.
  const existing = await db
    .collection<ProductDoc>("products")
    .findOne({ _id: new ObjectId(id) });
  if (!existing) return { ok: false, error: "Product not found." };

  await db.collection<ProductDoc>("products").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name: parsed.data.name,
        category: parsed.data.category,
        price: parsed.data.price,
        stock: parsed.data.stock,
        featured: parsed.data.featured,
        shortDescription: parsed.data.shortDescription,
        handmadeDetails: parsed.data.handmadeDetails,
        images: parsed.data.images.map((hex) => new ObjectId(hex)),
        updatedAt: new Date(),
      },
    }
  );
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid product id." };
  const db = await getDb();
  await db.collection<ProductDoc>("products").deleteOne({ _id: new ObjectId(id) });
  return { ok: true };
}
