"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { productSchema, type ProductInput } from "@/lib/validation/product";
import { createProduct, updateProduct } from "@/actions/productAdmin";
import { AdminButton } from "./AdminButton";
import { MultiImagePicker } from "./MultiImagePicker";
import type { Category } from "@/types/product";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

// RHF works with the zod _input_ type (featured is optional there due to .default(false)).
// The actions receive the validated output (ProductInput = z.output), so we cast on submit.
type FormValues = z.input<typeof productSchema>;

type Props = {
  categories: Category[];
  mode: "create" | "edit";
  productMongoId?: string; // hex _id for updates
  initial?: ProductInput & { slug: string };
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ categories, mode, productMongoId, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? {
      name: "",
      slug: "",
      category: categories[0]?.slug ?? "",
      price: 0,
      stock: 0,
      featured: false,
      shortDescription: "",
      handmadeDetails: [],
      images: [],
    },
  });

  const detailsArr = useFieldArray({ control, name: "handmadeDetails" as never });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    // zodResolver validates and coerces to ProductInput (output type); cast is safe.
    const validated = data as unknown as ProductInput;
    const res = isEdit && productMongoId
      ? await updateProduct(productMongoId, validated)
      : await createProduct(validated);
    if (res.ok) {
      toast.success(isEdit ? "Product saved" : "Product created");
      router.push("/admin/products");
    } else {
      toast.error(res.error);
      setSubmitting(false);
    }
  });

  const name = watch("name");
  // Auto-suggest slug on create when slug is blank.
  if (!isEdit && name && watch("slug") === "") {
    setValue("slug", slugify(name));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          {isEdit && (
            <p className="mt-1 text-[10px] text-brand-ink-muted">
              Slugs are permanent — create a new entry to change the URL.
            </p>
          )}
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Category</span>
          <select className={field} {...register("category")}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Price (₹)</span>
          <input className={field} type="number" {...register("price", { valueAsNumber: true })} />
          {errors.price && <span className="text-xs text-brand-pink">{errors.price.message}</span>}
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Stock</span>
          <input className={field} type="number" {...register("stock", { valueAsNumber: true })} />
        </label>
        <label className="flex items-center gap-3 mt-7">
          <input type="checkbox" {...register("featured")} />
          <span className="text-sm">Featured on home</span>
        </label>
      </div>

      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Short description</span>
        <textarea className={field} rows={3} {...register("shortDescription")} />
        {errors.shortDescription && (
          <span className="text-xs text-brand-pink">{errors.shortDescription.message}</span>
        )}
      </label>

      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Handmade details</span>
        <div className="space-y-2">
          {detailsArr.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <input className={field} {...register(`handmadeDetails.${i}` as const)} />
              <AdminButton type="button" variant="ghost" size="sm" onClick={() => detailsArr.remove(i)}>✕</AdminButton>
            </div>
          ))}
          <AdminButton type="button" variant="secondary" size="sm" onClick={() => detailsArr.append("")}>+ Detail</AdminButton>
        </div>
      </div>

      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Images</span>
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <MultiImagePicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.images && <span className="text-xs text-brand-pink">{(errors.images as { message?: string }).message}</span>}
      </div>

      <div className="flex gap-3 pt-4 border-t border-brand-blush">
        <AdminButton type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save" : "Create Product"}
        </AdminButton>
        <AdminButton href="/admin/products" variant="ghost">Cancel</AdminButton>
      </div>
    </form>
  );
}
