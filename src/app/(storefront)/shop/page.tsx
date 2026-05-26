import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ScriptHeading } from "@/components/brand/ScriptHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopControls } from "@/components/product/ShopControls";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { sortProducts, type SortKey } from "@/lib/sortProducts";
import { filterProducts } from "@/lib/filterProducts";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full collection of Maria Creations handmade flowers, candles, and gifts.",
};

const categoryLabels: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.name.toUpperCase()])
);

const VALID_SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "newest"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category;
  const sort = (VALID_SORTS.includes(sp.sort as SortKey) ? sp.sort : "featured") as SortKey;

  const filtered = filterProducts(products, category);
  const sorted = sortProducts(filtered, sort);

  const categoryLabel =
    category && category !== "all"
      ? categories.find((c) => c.slug === category)?.name
      : null;

  return (
    <Container className="py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-brand-ink-muted mb-3">
        <Link href="/" className="hover:text-brand-pink">Home</Link>
        <span className="mx-2">›</span>
        <span>Shop</span>
        {categoryLabel && (
          <>
            <span className="mx-2">›</span>
            <span className="text-brand-ink">{categoryLabel}</span>
          </>
        )}
      </nav>

      <ScriptHeading as="h1">
        {categoryLabel ?? "The Collection"}
      </ScriptHeading>

      <p className="mt-3 text-brand-ink-muted max-w-xl text-sm">
        {categoryLabel
          ? categories.find((c) => c.slug === category)?.description
          : "Every piece in our collection is handmade in Madurai. Browse by category or sort to find your favourite."}
      </p>

      <div className="mt-8">
        <ShopControls />
      </div>

      <div className="mt-8">
        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-script text-5xl text-brand-pink mb-3">Empty meadow</p>
            <p className="text-sm text-brand-ink-muted mb-6">
              No flowers match those filters yet 🌸
            </p>
            <Link
              href="/shop"
              className="inline-block text-brand-pink underline-offset-4 hover:underline text-sm font-semibold"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <ProductGrid>
            {sorted.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categoryLabel={categoryLabels[p.category]}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </Container>
  );
}
