"use server";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/adminSession";
import { categorySchema } from "@/lib/validation/category";
import type { CategoryDoc } from "@/types/catalog";

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function uniqueSlugCheck(slug: string, excludeId?: string): Promise<boolean> {
  const db = await getDb();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new ObjectId(excludeId) };
  }
  const existing = await db.collection<CategoryDoc>("categories").findOne(filter);
  return !existing;
}

export async function createCategory(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  if (!(await uniqueSlugCheck(parsed.data.slug))) {
    return { ok: false, error: "Slug already exists." };
  }
  const db = await getDb();
  const now = new Date();
  const _id = new ObjectId();
  const count = await db.collection<CategoryDoc>("categories").countDocuments();
  await db.collection<CategoryDoc>("categories").insertOne({
    _id,
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description,
    image: parsed.data.image ? new ObjectId(parsed.data.image) : null,
    order: count,
    createdAt: now,
    updatedAt: now,
  });
  return { ok: true, id: _id.toHexString() };
}

export async function updateCategory(id: string, input: unknown): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid id." };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  const db = await getDb();
  await db.collection<CategoryDoc>("categories").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        // slug immutable
        name: parsed.data.name,
        description: parsed.data.description,
        image: parsed.data.image ? new ObjectId(parsed.data.image) : null,
        updatedAt: new Date(),
      },
    }
  );
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdminSession();
  if (!ObjectId.isValid(id)) return { ok: false, error: "Invalid id." };
  const db = await getDb();
  const cat = await db.collection<CategoryDoc>("categories").findOne({ _id: new ObjectId(id) });
  if (!cat) return { ok: false, error: "Category not found." };
  const inUse = await db.collection("products").countDocuments({ category: cat.slug });
  if (inUse > 0) return { ok: false, error: `Cannot delete — ${inUse} product(s) still use this category.` };
  await db.collection<CategoryDoc>("categories").deleteOne({ _id: new ObjectId(id) });
  return { ok: true };
}

export async function reorderCategories(orderedSlugs: string[]): Promise<Result> {
  await requireAdminSession();
  const db = await getDb();
  const ops = orderedSlugs.map((slug, idx) => ({
    updateOne: {
      filter: { slug },
      update: { $set: { order: idx, updatedAt: new Date() } },
    },
  }));
  if (ops.length === 0) return { ok: true };
  await db.collection<CategoryDoc>("categories").bulkWrite(ops);
  return { ok: true };
}
