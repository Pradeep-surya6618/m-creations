import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/catalog";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminButton } from "@/components/admin/AdminButton";
import { formatPrice } from "@/lib/formatPrice";

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

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Products ({allProducts.length})</h1>
        <AdminButton href="/admin/products/new" size="sm">+ New Product</AdminButton>
      </header>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by name…"
          className="rounded-full border border-brand-blush bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        />
        <select
          name="category"
          defaultValue={sp.category ?? "all"}
          className="rounded-full border border-brand-blush bg-white px-4 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <AdminButton type="submit" variant="secondary" size="sm">Filter</AdminButton>
      </form>

      <AdminCard>
        <AdminTable
          rows={filtered}
          rowKey={(p) => p.id}
          emptyMessage="No products yet — add your first."
          columns={[
            { key: "thumb", label: "", render: (p) =>
                p.images[0] ? (
                  <div className="relative h-10 w-10 rounded overflow-hidden bg-brand-blush">
                    <Image src={p.images[0]} alt={p.name} fill sizes="40px" unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-brand-blush" />
                ),
              className: "w-16",
            },
            { key: "name", label: "Name", render: (p) => (
                // NOTE: the URL [id] segment is the public productId (e.g. "mc-p-001"),
                // not the Mongo _id hex. The edit page looks up the doc by productId
                // and passes _id.toHexString() to update/delete actions.
                <Link href={`/admin/products/${p.id}/edit`} className="font-semibold hover:text-brand-pink cursor-pointer">
                  {p.name}
                </Link>
            )},
            { key: "category", label: "Category", render: (p) => p.category },
            { key: "price", label: "Price", render: (p) => formatPrice(p.price), className: "tabular-nums" },
            { key: "stock", label: "Stock", render: (p) =>
                <span className={p.stock <= 0 ? "text-brand-pink font-bold" : ""}>{p.stock}</span>
            },
            { key: "featured", label: "Featured", render: (p) => (p.featured ? "★" : "") },
            { key: "actions", label: "", render: (p) => (
                <AdminButton href={`/admin/products/${p.id}/edit`} variant="ghost" size="sm">Edit</AdminButton>
            )},
          ]}
        />
      </AdminCard>
    </div>
  );
}
