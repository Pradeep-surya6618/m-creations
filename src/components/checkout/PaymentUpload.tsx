"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAllowedImage } from "@/lib/upload";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";

export function PaymentUpload({ orderId }: { orderId: string }) {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clear);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPick = (f: File | null) => {
    setError(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    const check = isAllowedImage(f.type, f.size);
    if (!check.ok) {
      setError(check.error);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (utr.trim()) fd.append("utr", utr.trim());
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          router.push(`/checkout/${orderId}/done`);
          return;
        }
        setError(json.error ?? "Something went wrong. Please try again.");
        toast.error(json.error ?? "Upload failed — please try again");
        setSubmitting(false);
        return;
      }
      clearCart();
      toast.success("Payment proof submitted");
      router.push(`/checkout/${orderId}/done`);
    } catch {
      setError("Network error — please try again.");
      toast.error("Network error — please try again");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer rounded-2xl border-2 border-dashed border-brand-pink-soft bg-brand-blush/20 px-4 py-8 text-center text-brand-ink-muted hover:bg-brand-blush/30 transition-colors"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Payment screenshot preview" className="mx-auto max-h-48 rounded-xl" />
        ) : (
          <>
            <span className="block text-3xl mb-2">📷</span>
            <span className="text-sm font-semibold">Tap to upload payment screenshot</span>
            <span className="block text-xs mt-1">JPG / PNG / WebP · max 2MB</span>
          </>
        )}
      </button>
      {file && <p className="mt-2 text-xs text-brand-ink-muted truncate">{file.name}</p>}

      <input
        value={utr}
        onChange={(e) => setUtr(e.target.value)}
        placeholder="UTR / transaction no. (optional)"
        className="mt-4 w-full rounded-full border border-brand-blush bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
      />

      {error && <p className="mt-3 text-sm text-brand-pink font-semibold" role="alert">{error}</p>}

      <Button
        type="button"
        variant="gradient"
        size="lg"
        onClick={onSubmit}
        disabled={!file || submitting}
        className="mt-4 w-full"
      >
        {submitting ? "Submitting…" : "Submit Payment Proof"}
      </Button>
    </div>
  );
}
