"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type Props = {
  value: string[]; // ObjectId hex IDs
  onChange: (next: string[]) => void;
  max?: number;
};

export function MultiImagePicker({ value, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList) => {
    if (value.length + files.length > max) {
      toast.error(`Maximum ${max} images.`);
      return;
    }
    setUploading(true);
    const next = [...value];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/images", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.id) {
          toast.error(json.error ?? `Upload failed for ${file.name}`);
          continue;
        }
        next.push(json.id);
      } catch {
        toast.error(`Upload failed for ${file.name}`);
      }
    }
    onChange(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((id, idx) => (
          <div key={id + idx} className="relative aspect-square rounded-xl overflow-hidden bg-brand-blush border border-brand-blush">
            <Image
              src={`/api/images/${id}`}
              alt={`Image ${idx + 1}`}
              fill
              sizes="120px"
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 bg-white/80 backdrop-blur">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="text-xs px-1 cursor-pointer disabled:opacity-30"
                aria-label="Move left"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs px-1 cursor-pointer text-red-600"
                aria-label="Remove"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === value.length - 1}
                className="text-xs px-1 cursor-pointer disabled:opacity-30"
                aria-label="Move right"
              >
                →
              </button>
            </div>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed border-brand-pink-soft bg-brand-blush/20",
              "flex flex-col items-center justify-center text-xs text-brand-ink-muted",
              "cursor-pointer hover:bg-brand-blush/30 transition-colors disabled:opacity-50"
            )}
          >
            <span className="text-2xl">+</span>
            <span className="mt-1">{uploading ? "Uploading…" : "Add image"}</span>
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-brand-ink-muted">
        {value.length}/{max} · JPG/PNG/WebP · ≤5MB each
      </p>
    </div>
  );
}
