"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { reorderCategories } from "@/actions/categoryAdmin";
import { AdminButton } from "./AdminButton";
import type { Category } from "@/types/product";

type Row = Category & { productCount: number; mongoId: string };

export function CategoryReorderList({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const onDrop = (target: number) => {
    if (dragIdx === null || dragIdx === target) {
      setDragIdx(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(target, 0, moved);
    setRows(next);
    setDragIdx(null);
    start(async () => {
      const res = await reorderCategories(next.map((r) => r.slug));
      if (res.ok) toast.success("Order saved");
      else toast.error(res.error);
    });
  };

  return (
    <ul className="divide-y divide-brand-blush">
      {rows.map((c, idx) => (
        <li
          key={c.slug}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(idx)}
          className="flex items-center gap-4 py-3 cursor-grab active:cursor-grabbing"
        >
          <span className="text-brand-ink-muted">≡</span>
          {c.image ? (
            <div className="relative h-10 w-10 rounded overflow-hidden bg-brand-blush">
              <Image src={c.image} alt={c.name} fill sizes="40px" unoptimized className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded bg-brand-blush" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-brand-ink-muted font-mono">{c.slug}</p>
          </div>
          <p className="text-xs text-brand-ink-muted">{c.productCount} prod.</p>
          <AdminButton href={`/admin/categories/${c.mongoId}/edit`} variant="ghost" size="sm">Edit</AdminButton>
        </li>
      ))}
      {pending && <li className="py-2 text-xs text-brand-ink-muted text-center">Saving order…</li>}
    </ul>
  );
}
