import type { Metadata } from "next";
import { getDb } from "@/lib/mongodb";
import { mapCategoryDoc } from "@/lib/mapProductDoc";
import { AdminButton } from "@/components/admin/AdminButton";
import { CategoryReorderList } from "@/components/admin/CategoryReorderList";
import type { CategoryDoc } from "@/types/catalog";

export const metadata: Metadata = { title: "Admin · Categories" };

export default async function CategoriesListPage() {
  const db = await getDb();
  const docs = await db
    .collection<CategoryDoc>("categories")
    .find({})
    .sort({ order: 1 })
    .toArray();
  const rows = await Promise.all(
    docs.map(async (d) => {
      const productCount = await db
        .collection("products")
        .countDocuments({ category: d.slug });
      return { ...mapCategoryDoc(d), productCount, mongoId: d._id.toHexString() };
    })
  );

  const totalProducts = rows.reduce((acc, r) => acc + r.productCount, 0);

  return (
    <div className="space-y-6 w-full">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-brand-pink-dark font-bold">
            Catalog
          </p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-brand-ink">Categories</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-blush text-brand-pink-dark text-xs font-bold tabular-nums">
              {rows.length}
            </span>
          </div>
          {rows.length > 0 && (
            <p className="mt-1.5 text-xs text-brand-ink-muted">
              {totalProducts} {totalProducts === 1 ? "product" : "products"} across these collections — drag to reorder.
            </p>
          )}
        </div>
        <AdminButton href="/admin/categories/new">+ New Category</AdminButton>
      </header>

      {/* ─── List card ─────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <section className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm py-16 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-blush/60 inline-flex items-center justify-center text-brand-pink-dark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <p className="text-sm text-brand-ink-muted">
            No categories yet — add your first to start grouping products.
          </p>
        </section>
      ) : (
        <CategoryReorderList initial={rows} />
      )}
    </div>
  );
}
