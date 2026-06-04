import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/catalog";
import { AdminButton } from "@/components/admin/AdminButton";
import { ProductsFilterBar } from "@/components/admin/ProductsFilterBar";
import { formatPrice } from "@/lib/formatPrice";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Admin · Products" };

export default async function AdminProductsList({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  const filtered = allProducts.filter((p) => {
    if (sp.category && sp.category !== "all" && p.category !== sp.category) return false;
    if (sp.q && !p.name.toLowerCase().includes(sp.q.toLowerCase())) return false;
    return true;
  });

  const categoryNameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  const totalLow = allProducts.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const totalOut = allProducts.filter((p) => p.stock <= 0).length;
  const isFiltered = filtered.length !== allProducts.length;

  return (
    <div className="space-y-6 w-full">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-brand-pink-dark font-bold">
            Catalog
          </p>
          <div className="mt-1.5 flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-brand-ink">Products</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-blush text-brand-pink-dark text-xs font-bold tabular-nums">
              {allProducts.length}
            </span>
          </div>
        </div>
        <AdminButton href="/admin/products/new">+ New Product</AdminButton>
      </header>

      {/* ─── Stat strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill labelLong="Live" labelShort="Live" value={allProducts.length} tone="default" />
        <StatPill labelLong="Low stock" labelShort="Low" value={totalLow} tone={totalLow > 0 ? "warn" : "default"} />
        <StatPill labelLong="Out of stock" labelShort="Out" value={totalOut} tone={totalOut > 0 ? "alert" : "default"} />
      </div>

      {/* ─── Filter bar ────────────────────────────────────────────────── */}
      <ProductsFilterBar categories={categories} />

      {/* ─── Table card ────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm overflow-hidden">
        <header className="px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-brand-blush">
          <p className="text-[11px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold">
            {isFiltered ? `${filtered.length} of ${allProducts.length}` : `${allProducts.length} total`}
          </p>
          {isFiltered && (
            <Link
              href="/admin/products"
              className="text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
            >
              Clear filters →
            </Link>
          )}
        </header>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-blush/60 inline-flex items-center justify-center text-brand-pink-dark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-sm text-brand-ink-muted">No products match your filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop / md+ table */}
            <table className="hidden md:table w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-brand-ink-muted">
                <tr className="border-b border-brand-blush">
                  <th className="py-3 px-5 sm:px-6 font-bold w-[44%]">Product</th>
                  <th className="py-3 px-3 font-bold">Category</th>
                  <th className="py-3 px-3 font-bold text-right">Price</th>
                  <th className="py-3 px-3 font-bold text-center">Stock</th>
                  <th className="py-3 px-3 font-bold text-center">Featured</th>
                  <th className="py-3 px-5 sm:px-6 font-bold w-[1%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blush/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="group hover:bg-brand-cream/50 transition-colors">
                    <td className="py-3 px-5 sm:px-6">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="flex items-center gap-3.5 cursor-pointer"
                      >
                        <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-brand-blush ring-1 ring-brand-blush/80 group-hover:ring-brand-pink/40 transition-all">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="48px"
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-brand-pink/60 text-xs font-bold">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-ink truncate group-hover:text-brand-pink transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-brand-ink-muted font-mono mt-0.5">
                            {p.id}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <CategoryChip slug={p.category} name={categoryNameBySlug.get(p.category) ?? p.category} />
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-brand-ink tabular-nums">
                      {formatPrice(p.price)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex justify-center">
                        <StockPill stock={p.stock} />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <FeaturedStar on={p.featured} />
                    </td>
                    <td className="py-3 px-5 sm:px-6 text-right">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
                      >
                        Edit
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                          <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="md:hidden divide-y divide-brand-blush/60">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center gap-2.5 px-3 py-3 active:bg-brand-cream/60 cursor-pointer"
                  >
                    <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-brand-blush">
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill sizes="48px" unoptimized className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-brand-pink/60 text-sm font-bold">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-brand-ink truncate text-sm">{p.name}</p>
                        {p.featured && <FeaturedStar on small />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <CategoryChip slug={p.category} name={categoryNameBySlug.get(p.category) ?? p.category} />
                        <span className="text-xs font-semibold text-brand-ink tabular-nums">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                    <StockPill stock={p.stock} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Small presentational helpers — local to keep the page self-contained.
   ────────────────────────────────────────────────────────────────────── */

function StatPill({
  labelLong,
  labelShort,
  value,
  tone,
}: {
  labelLong: string;
  labelShort: string;
  value: number;
  tone: "default" | "warn" | "alert";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3 shadow-petal-sm transition-shadow",
        tone === "alert" && "border-red-200",
        tone === "warn" && "border-amber-200",
        tone === "default" && "border-brand-blush"
      )}
    >
      <span
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 shrink-0 inline-flex items-center justify-center rounded-full text-sm font-bold tabular-nums",
          tone === "alert" && "bg-red-50 text-red-600",
          tone === "warn" && "bg-amber-50 text-amber-700",
          tone === "default" && "bg-brand-blush text-brand-pink-dark"
        )}
      >
        {value}
      </span>
      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-brand-ink-muted font-bold leading-tight">
        <span className="sm:hidden">{labelShort}</span>
        <span className="hidden sm:inline">{labelLong}</span>
      </span>
    </div>
  );
}

function CategoryChip({ slug, name }: { slug: string; name: string }) {
  return (
    <span
      title={slug}
      className="inline-block px-2.5 py-0.5 rounded-full bg-brand-blush/60 text-brand-pink-dark text-[10px] font-bold uppercase tracking-wider"
    >
      {name}
    </span>
  );
}

function StockPill({ stock }: { stock: number }) {
  const isOut = stock <= 0;
  const isLow = stock > 0 && stock <= 3;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums",
        isOut
          ? "bg-red-50 text-red-600"
          : isLow
            ? "bg-amber-50 text-amber-700"
            : "bg-emerald-50 text-emerald-700"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
        )}
      />
      {stock}
    </span>
  );
}

function FeaturedStar({ on, small }: { on?: boolean; small?: boolean }) {
  if (!on) return <span className="text-brand-ink-muted/30 text-sm">—</span>;
  const size = small ? 12 : 16;
  return (
    <svg
      className="inline-block text-brand-pink"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Featured"
    >
      <path d="M12 2l2.6 7.4H22l-6 4.4 2.3 7.2-6.3-4.5L5.7 21l2.3-7.2-6-4.4h7.4z" />
    </svg>
  );
}
