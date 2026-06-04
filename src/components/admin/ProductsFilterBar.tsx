"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AdminSelect } from "./AdminSelect";
import { fieldClasses } from "./AdminFormPrimitives";
import type { Category } from "@/types/product";

type Props = {
  categories: Category[];
};

export function ProductsFilterBar({ categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [pending, start] = useTransition();

  // Keep local state in sync with URL params when user uses back/forward.
  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCategory(params.get("category") ?? "all");
  }, [params]);

  const apply = (nextQ: string, nextCategory: string) => {
    const sp = new URLSearchParams();
    if (nextQ) sp.set("q", nextQ);
    if (nextCategory && nextCategory !== "all") sp.set("category", nextCategory);
    const query = sp.toString();
    start(() => {
      router.push(query ? `/admin/products?${query}` : "/admin/products");
    });
  };

  const hasFilters = q !== "" || (category !== "all" && category !== "");

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <section
      data-pending={pending || undefined}
      className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm p-4 sm:p-5 transition-opacity data-[pending]:opacity-70"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(q, category);
        }}
        className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(0,260px)_auto] gap-3 items-center"
      >
        {/* Search input — leading search icon, full width */}
        <div className="relative">
          <span
            aria-hidden
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink-muted pointer-events-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            className={`${fieldClasses()} pl-10`}
          />
        </div>

        {/* Category — premium popup select */}
        <AdminSelect
          value={category}
          options={categoryOptions}
          onChange={(next) => {
            setCategory(next);
            // Auto-apply when user picks a different category (search still
            // needs Enter / Filter to commit, so they don't pay a request per
            // keystroke).
            apply(q, next);
          }}
          placeholder="All categories"
        />

        {/* Apply + Clear actions */}
        <div className="flex items-center gap-2 justify-end">
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCategory("all");
                apply("", "all");
              }}
              className="text-xs font-semibold text-brand-ink-muted hover:text-brand-pink-dark cursor-pointer transition-colors px-2"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center h-[50px] px-5 rounded-xl bg-brand-gradient text-white text-xs font-bold uppercase tracking-wider shadow-petal-sm hover:shadow-petal-md cursor-pointer transition-shadow"
          >
            Apply
          </button>
        </div>
      </form>
    </section>
  );
}
