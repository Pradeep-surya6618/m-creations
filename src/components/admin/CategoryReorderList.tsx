"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { reorderCategories } from "@/actions/categoryAdmin";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/product";

type Row = Category & { productCount: number; mongoId: string };

export function CategoryReorderList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const onDrop = (target: number) => {
    if (dragIdx === null || dragIdx === target) {
      setDragIdx(null);
      setHoverIdx(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(target, 0, moved);
    setRows(next);
    setDragIdx(null);
    setHoverIdx(null);
    start(async () => {
      const res = await reorderCategories(next.map((r) => r.slug));
      if (res.ok) toast.success("Order saved");
      else toast.error(res.error);
    });
  };

  return (
    <section
      data-pending={pending || undefined}
      className="rounded-2xl bg-white border border-brand-blush shadow-petal-sm overflow-hidden transition-opacity data-[pending]:opacity-70"
    >
      <ul>
        {rows.map((c, idx) => {
          const isDragging = dragIdx === idx;
          const isDropTarget = hoverIdx === idx && dragIdx !== null && dragIdx !== idx;
          return (
            <li
              key={c.slug}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragEnter={() => dragIdx !== null && setHoverIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => {
                setDragIdx(null);
                setHoverIdx(null);
              }}
              onDrop={() => onDrop(idx)}
              className={cn(
                "group relative flex items-center gap-4 px-4 sm:px-6 py-3.5 border-b border-brand-blush/60 last:border-b-0 transition-all",
                isDragging && "opacity-40",
                isDropTarget && "bg-brand-blush/30",
                !isDragging && "hover:bg-brand-cream/50"
              )}
            >
              {/* Drag handle — 6-dot grip */}
              <span
                aria-hidden
                className="shrink-0 text-brand-ink-muted/60 group-hover:text-brand-pink cursor-grab active:cursor-grabbing transition-colors"
              >
                <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden>
                  <circle cx="4" cy="4" r="1.5" />
                  <circle cx="10" cy="4" r="1.5" />
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="4" cy="16" r="1.5" />
                  <circle cx="10" cy="16" r="1.5" />
                </svg>
              </span>

              {/* Thumbnail */}
              <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-brand-blush ring-1 ring-brand-blush/80">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="48px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-brand-pink/60 text-sm font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + slug */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-ink truncate">{c.name}</p>
                <p className="text-[11px] text-brand-ink-muted font-mono mt-0.5 truncate">
                  {c.slug}
                </p>
              </div>

              {/* Product count pill */}
              <span
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums",
                  c.productCount === 0
                    ? "bg-brand-cream text-brand-ink-muted"
                    : "bg-brand-blush/60 text-brand-pink-dark"
                )}
              >
                {c.productCount}
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  {c.productCount === 1 ? "prod" : "prods"}
                </span>
              </span>

              {/* Edit */}
              <Link
                href={`/admin/categories/${c.mongoId}/edit`}
                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
              >
                Edit
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
      {pending && (
        <div className="px-6 py-2.5 border-t border-brand-blush/60 text-[11px] uppercase tracking-wider text-brand-ink-muted font-bold flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-pink animate-pulse" />
          Saving order…
        </div>
      )}
    </section>
  );
}
