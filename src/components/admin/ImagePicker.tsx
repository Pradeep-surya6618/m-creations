"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { AdminButton } from "./AdminButton";

type Props = {
  value: string | null;
  onChange: (next: string | null) => void;
};

export function ImagePicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (f: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.id) {
        toast.error(json.error ?? "Upload failed");
      } else {
        onChange(json.id);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {value ? (
        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-brand-blush border border-brand-blush">
          <Image src={`/api/images/${value}`} alt="" fill sizes="96px" unoptimized className="object-cover" />
        </div>
      ) : (
        <div className="h-24 w-24 rounded-xl bg-brand-blush/40 flex items-center justify-center text-brand-ink-muted text-xs">
          No image
        </div>
      )}
      <div className="flex flex-col gap-2">
        <AdminButton type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </AdminButton>
        {value && (
          <AdminButton type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Remove</AdminButton>
        )}
      </div>
    </div>
  );
}
