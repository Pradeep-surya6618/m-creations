"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Select, type SelectOption } from "@/components/ui/Select";
import { categories } from "@/data/categories";

const sortOptions: SelectOption[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "newest", label: "Newest" },
];

export function ShopControls() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get("category") ?? "all";
  const activeSort = params.get("sort") ?? "featured";

  const categoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((c) => ({ value: c.slug, label: c.name })),
    ],
    []
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "all" || value === "featured") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      router.push(qs ? `${path}?${qs}` : path);
    },
    [params, router, path]
  );

  return (
    <div className="sticky top-16 lg:top-20 z-30 bg-brand-cream/85 backdrop-blur-md py-4 -mx-5 sm:-mx-8 px-5 sm:px-8 border-b border-brand-blush">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          label="Filter"
          value={activeCategory}
          options={categoryOptions}
          onChange={(v) => setParam("category", v)}
        />
        <Select
          label="Sort"
          value={activeSort}
          options={sortOptions}
          onChange={(v) => setParam("sort", v)}
          alignEnd
        />
      </div>
    </div>
  );
}
