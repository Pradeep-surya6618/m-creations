"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categoryAdmin";
import { AdminButton } from "./AdminButton";
import { AdminConfirmDialog } from "./AdminConfirmDialog";
import { ImagePicker } from "./ImagePicker";
import {
  CharCount,
  Field,
  FormSection,
  fieldClasses,
} from "./AdminFormPrimitives";

// Hard cap comes from the zod schema — single source of truth.
const DESCRIPTION_MAX = 200;

type Props = {
  mode: "create" | "edit";
  mongoId?: string;
  /** Live product count for this category — drives the delete dialog. */
  productCount?: number;
  initial?: CategoryInput;
};

export function CategoryForm({ mode, mongoId, productCount = 0, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isEdit = mode === "edit";
  const canDelete = productCount === 0;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial ?? { name: "", slug: "", description: "", image: null },
  });

  const descLen = (watch("description") ?? "").length;
  const descOverMax = descLen > DESCRIPTION_MAX;

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

  const onConfirmDelete = async () => {
    if (!mongoId) return;
    setDeleting(true);
    const res = await deleteCategory(mongoId);
    if (res.ok) {
      toast.success("Category deleted");
      router.push("/admin/categories");
    } else {
      toast.error(res.error);
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <FormSection
        title="Basics"
        subtitle="Display name and the URL slug used in the storefront."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Name" error={errors.name?.message}>
            <input
              className={fieldClasses(errors.name)}
              placeholder="e.g. Handmade Bouquets"
              {...register("name")}
            />
          </Field>
          <Field
            label="Slug"
            hint={isEdit ? "Permanent — create a new entry to change." : "lowercase-kebab-case"}
            error={errors.slug?.message}
          >
            <input
              className={fieldClasses(errors.slug)}
              placeholder="handmade-bouquets"
              disabled={isEdit}
              {...register("slug")}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Description"
        subtitle="Shown on the category page below the title."
      >
        <Field
          label="Description"
          error={errors.description?.message}
          rightSlot={<CharCount value={descLen} max={DESCRIPTION_MAX} />}
        >
          <textarea
            className={`${fieldClasses(errors.description)} resize-y`}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            placeholder="A short paragraph that introduces this collection…"
            {...register("description")}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Image"
        subtitle="Square thumbnail used in the categories grid."
      >
        <Controller
          control={control}
          name="image"
          render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />}
        />
      </FormSection>

      <footer className="flex items-center gap-3 pt-2">
        {isEdit && (
          <AdminButton
            type="button"
            variant="danger"
            onClick={() => setDeleteOpen(true)}
            disabled={deleting}
          >
            Delete
          </AdminButton>
        )}
        <div className="ml-auto flex items-center gap-3">
          <AdminButton href="/admin/categories" variant="ghost">
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={submitting || descOverMax}>
            {submitting ? "Saving…" : isEdit ? "Save" : "Create"}
          </AdminButton>
        </div>
      </footer>

      {/* Delete confirmation — info variant when products still reference
          this category (server would refuse anyway, but we tell the user
          upfront), danger variant when the category is empty. */}
      <AdminConfirmDialog
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        variant={canDelete ? "danger" : "info"}
        title={canDelete ? "Delete this category?" : "Can't delete yet"}
        description={
          canDelete ? (
            <>
              <span className="font-semibold text-white">{initial?.name}</span>{" "}
              will be removed. This can't be undone.
            </>
          ) : (
            <>
              <span className="font-semibold text-white">{initial?.name}</span>{" "}
              is used by{" "}
              <span className="font-semibold text-white">
                {productCount} {productCount === 1 ? "product" : "products"}
              </span>
              . Move or delete those products first, then come back.
            </>
          )
        }
        confirmLabel={canDelete ? "Delete category" : undefined}
        onConfirm={canDelete ? onConfirmDelete : undefined}
        loading={deleting}
      />
    </form>
  );
}
