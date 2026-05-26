"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { categories } from "@/data/categories";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
  { value: "newest", label: "Newest" },
] as const;

export function ShopControls() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const activeCategory = params.get("category") ?? "all";
  const activeSort = params.get("sort") ?? "featured";

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
          <CatChip
            label="All"
            active={activeCategory === "all"}
            onClick={() => setParam("category", null)}
          />
          {categories.map((c) => (
            <CatChip
              key={c.slug}
              label={c.name}
              active={activeCategory === c.slug}
              onClick={() => setParam("category", c.slug)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="sort" className="text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-semibold">
            Sort:
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="bg-white border border-brand-blush rounded-full px-4 py-2 text-sm text-brand-ink font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-all border",
        active
          ? "bg-brand-pink text-white border-brand-pink shadow-petal-sm"
          : "bg-white/85 text-brand-ink-muted border-brand-blush hover:bg-white"
      )}
    >
      {label}
    </button>
  );
}
