"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/productAdmin";
import { AdminButton } from "./AdminButton";

export function DeleteProductButton({
  productMongoId,
  productName,
}: {
  productMongoId: string;
  productName: string;
}) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = typed.trim().toLowerCase() === productName.toLowerCase();

  const onConfirm = async () => {
    setSubmitting(true);
    const res = await deleteProduct(productMongoId);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-red-200 rounded-2xl bg-red-50/40 max-w-md">
      <p className="text-sm font-semibold text-red-700">Delete this product?</p>
      <p className="text-xs text-brand-ink-muted">
        Type <span className="font-mono">{productName}</span> to confirm.
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="w-full rounded border border-red-300 bg-white px-3 py-2 text-sm"
      />
      <AdminButton variant="danger" disabled={!canSubmit || submitting} onClick={onConfirm}>
        {submitting ? "Deleting…" : "Delete"}
      </AdminButton>
    </div>
  );
}
