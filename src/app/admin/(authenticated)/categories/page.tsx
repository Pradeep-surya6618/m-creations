import type { Metadata } from "next";
import { getDb } from "@/lib/mongodb";
import { mapCategoryDoc } from "@/lib/mapProductDoc";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { CategoryReorderList } from "@/components/admin/CategoryReorderList";
import type { CategoryDoc } from "@/types/catalog";

export const metadata: Metadata = { title: "Admin · Categories" };

export default async function CategoriesListPage() {
  const db = await getDb();
  const docs = await db.collection<CategoryDoc>("categories").find({}).sort({ order: 1 }).toArray();
  const rows = await Promise.all(
    docs.map(async (d) => {
      const productCount = await db.collection("products").countDocuments({ category: d.slug });
      return { ...mapCategoryDoc(d), productCount, mongoId: d._id.toHexString() };
    })
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <AdminButton href="/admin/categories/new" size="sm">+ New Category</AdminButton>
      </header>

      <AdminCard>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-brand-ink-muted">No categories yet — add your first.</p>
        ) : (
          <CategoryReorderList initial={rows} />
        )}
      </AdminCard>
    </div>
  );
}
