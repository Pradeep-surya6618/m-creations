import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminButton } from "@/components/admin/AdminButton";

export const metadata: Metadata = { title: "Admin · New Product" };

export default async function NewProductPage() {
  const categories = await getAllCategories();

  // ProductForm requires at least one category for the select. Rather than
  // letting the user fill in the whole form and get a validation error on
  // submit, surface the blocker upfront with a direct CTA.
  if (categories.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <AdminBackLink href="/admin/products" label="Products" />
        <h1 className="text-2xl font-bold">New product</h1>

        <section className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm p-6 sm:p-8">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-brand-blush/60 inline-flex items-center justify-center text-brand-pink-dark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-brand-ink text-center">
            Create a category first
          </h2>
          <p className="mt-2 text-sm text-brand-ink-muted text-center max-w-md mx-auto leading-relaxed">
            Every product needs to live in a category (Bouquets, Pipe Cleaner,
            Floral Gifts…). Set up at least one collection, then come back to
            add your first product.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <AdminButton href="/admin/categories/new" variant="primary">
              + New Category
            </AdminButton>
            <Link
              href="/admin/categories"
              className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted hover:text-brand-pink-dark cursor-pointer transition-colors"
            >
              View categories
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <AdminBackLink href="/admin/products" label="Products" />
      <h1 className="text-2xl font-bold">New product</h1>
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
