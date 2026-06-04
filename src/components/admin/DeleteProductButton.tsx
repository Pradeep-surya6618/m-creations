"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/productAdmin";
import { AdminButton } from "./AdminButton";
import { AdminConfirmDialog } from "./AdminConfirmDialog";

export function DeleteProductButton({
  productMongoId,
  productName,
}: {
  productMongoId: string;
  productName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onConfirm = async () => {
    setDeleting(true);
    const res = await deleteProduct(productMongoId);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
    } else {
      toast.error(res.error);
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-red-200 bg-red-50/40">
        <div>
          <p className="text-sm font-semibold text-red-700">Danger zone</p>
          <p className="mt-0.5 text-xs text-brand-ink-muted">
            Permanently delete this product and all of its images from the catalog.
          </p>
        </div>
        <AdminButton
          type="button"
          variant="danger"
          onClick={() => setOpen(true)}
        >
          Delete
        </AdminButton>
      </div>

      <AdminConfirmDialog
        open={open}
        onClose={() => {
          if (!deleting) setOpen(false);
        }}
        variant="danger"
        title="Delete this product?"
        description={
          <>
            <span className="font-semibold text-white">{productName}</span>{" "}
            will be removed from the catalog along with its images. This can't be
            undone.
          </>
        }
        confirmLabel="Delete product"
        onConfirm={onConfirm}
        loading={deleting}
      />
    </>
  );
}
