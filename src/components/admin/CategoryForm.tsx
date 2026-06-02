"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categoryAdmin";
import { AdminButton } from "./AdminButton";
import { ImagePicker } from "./ImagePicker";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

type Props = {
  mode: "create" | "edit";
  mongoId?: string;
  initial?: CategoryInput;
};

export function CategoryForm({ mode, mongoId, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial ?? { name: "", slug: "", description: "", image: null },
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = isEdit && mongoId
      ? await updateCategory(mongoId, data)
      : await createCategory(data);
    if (res.ok) {
      toast.success(isEdit ? "Category saved" : "Category created");
      router.push("/admin/categories");
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  });

  const onDelete = async () => {
    if (!mongoId) return;
    if (!confirm("Delete this category?")) return;
    setDeleting(true);
    const res = await deleteCategory(mongoId);
    if (res.ok) {
      toast.success("Category deleted");
      router.push("/admin/categories");
    } else {
      toast.error(res.error);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Name</span>
        <input className={field} {...register("name")} />
        {errors.name && <span className="text-xs text-brand-pink">{errors.name.message}</span>}
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">
          Slug {isEdit && <span className="text-brand-pink-dark">(permanent)</span>}
        </span>
        <input className={field} {...register("slug")} disabled={isEdit} />
        {errors.slug && <span className="text-xs text-brand-pink">{errors.slug.message}</span>}
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Description</span>
        <textarea className={field} rows={3} {...register("description")} />
        {errors.description && <span className="text-xs text-brand-pink">{errors.description.message}</span>}
      </label>
      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Image</span>
        <Controller
          control={control}
          name="image"
          render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className="flex gap-3 pt-4 border-t border-brand-blush">
        <AdminButton type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save" : "Create"}
        </AdminButton>
        <AdminButton href="/admin/categories" variant="ghost">Cancel</AdminButton>
        {isEdit && (
          <AdminButton type="button" variant="danger" onClick={onDelete} disabled={deleting} className="ml-auto">
            {deleting ? "Deleting…" : "Delete"}
          </AdminButton>
        )}
      </div>
    </form>
  );
}
