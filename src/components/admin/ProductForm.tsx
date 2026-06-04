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
import { AdminSelect } from "./AdminSelect";
import { MultiImagePicker } from "./MultiImagePicker";
import {
  CharCount,
  Field,
  FormSection,
  fieldClasses,
} from "./AdminFormPrimitives";
import type { Category } from "@/types/product";

// Hard caps come from the zod schema — single source of truth for the
// counter in the description field.
const SHORT_DESCRIPTION_MAX = 200;

// RHF works with the zod _input_ type (featured is optional there due to
// .default(false)). The actions receive the validated output (ProductInput
// = z.output), so we cast on submit.
type FormValues = z.input<typeof productSchema>;

type Props = {
  categories: Category[];
  mode: "create" | "edit";
  productMongoId?: string;
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

  const shortDescLen = (watch("shortDescription") ?? "").length;
  const shortDescOver = shortDescLen > SHORT_DESCRIPTION_MAX;

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

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      {/* ─── Basics ─────────────────────────────────────────────────────── */}
      <FormSection
        title="Basics"
        subtitle="Display name and the URL slug used in the storefront."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Name" error={errors.name?.message}>
            <input
              className={fieldClasses(errors.name)}
              placeholder="e.g. Rose Garden Bouquet"
              {...register("name")}
            />
          </Field>
          <Field
            label="Slug"
            hint={isEdit ? "Permanent — create a new entry to change the URL." : "lowercase-kebab-case"}
            error={errors.slug?.message}
          >
            <input
              className={fieldClasses(errors.slug)}
              placeholder="rose-garden-bouquet"
              disabled={isEdit}
              {...register("slug")}
            />
          </Field>
        </div>
      </FormSection>

      {/* ─── Pricing & inventory ───────────────────────────────────────── */}
      <FormSection
        title="Pricing & inventory"
        subtitle="Category, list price, stock on hand, and whether it appears on the home page."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Category" error={errors.category?.message}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <AdminSelect
                  value={field.value}
                  options={categoryOptions}
                  onChange={field.onChange}
                  placeholder="Choose a category"
                  error={errors.category?.message}
                />
              )}
            />
          </Field>
          <Field label="Price (₹)" error={errors.price?.message}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className={fieldClasses(errors.price)}
              placeholder="0"
              {...register("price", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Stock" error={errors.stock?.message}>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className={fieldClasses(errors.stock)}
              placeholder="0"
              {...register("stock", { valueAsNumber: true })}
            />
          </Field>
          {/* Featured — premium checkbox styled as a toggle card */}
          <Field label="Visibility">
            <label className="flex items-center gap-3 h-[50px] px-4 rounded-xl border border-brand-blush bg-white cursor-pointer hover:border-brand-pink/60 transition-colors">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-pink cursor-pointer"
                {...register("featured")}
              />
              <span className="text-sm text-brand-ink">Featured on home</span>
            </label>
          </Field>
        </div>
      </FormSection>

      {/* ─── Description ────────────────────────────────────────────────── */}
      <FormSection
        title="Description"
        subtitle="A short paragraph shown beneath the product name."
      >
        <Field
          label="Short description"
          error={errors.shortDescription?.message}
          rightSlot={<CharCount value={shortDescLen} max={SHORT_DESCRIPTION_MAX} />}
        >
          <textarea
            className={`${fieldClasses(errors.shortDescription)} resize-y`}
            rows={4}
            maxLength={SHORT_DESCRIPTION_MAX}
            placeholder="Describe what makes this piece special…"
            {...register("shortDescription")}
          />
        </Field>
      </FormSection>

      {/* ─── Handmade details ──────────────────────────────────────────── */}
      <FormSection
        title="Handmade details"
        subtitle="Bullet points shown in the product page sidebar (max 10)."
      >
        <div className="space-y-2.5">
          {detailsArr.fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <input
                className={fieldClasses()}
                placeholder={`Detail ${i + 1}`}
                {...register(`handmadeDetails.${i}` as const)}
              />
              <button
                type="button"
                onClick={() => detailsArr.remove(i)}
                aria-label={`Remove detail ${i + 1}`}
                className="shrink-0 h-[50px] w-[50px] inline-flex items-center justify-center rounded-xl border border-brand-blush bg-white text-brand-ink-muted hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
          {detailsArr.fields.length < 10 && (
            <AdminButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => detailsArr.append("")}
            >
              + Add detail
            </AdminButton>
          )}
        </div>
      </FormSection>

      {/* ─── Media ──────────────────────────────────────────────────────── */}
      <FormSection
        title="Images"
        subtitle="Up to 6 photos. The first one is the cover."
      >
        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <MultiImagePicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.images && (
          <span className="block mt-2 text-[11px] font-semibold text-red-600">
            {(errors.images as { message?: string }).message}
          </span>
        )}
      </FormSection>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="flex items-center gap-3 pt-2">
        <div className="ml-auto flex items-center gap-3">
          <AdminButton href="/admin/products" variant="ghost">
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={submitting || shortDescOver}>
            {submitting ? "Saving…" : isEdit ? "Save" : "Create Product"}
          </AdminButton>
        </div>
      </footer>
    </form>
  );
}
