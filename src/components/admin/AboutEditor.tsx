"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { aboutSchema, type AboutInput } from "@/lib/validation/content";
import { updateAboutContent } from "@/actions/contentAdmin";
import { AdminButton } from "./AdminButton";
import { ImagePicker } from "./ImagePicker";
import { MarkdownPreview } from "./MarkdownPreview";

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function AboutEditor({ initial }: { initial: AboutInput }) {
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<AboutInput>({
    resolver: zodResolver(aboutSchema),
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = await updateAboutContent(data);
    if (res.ok) toast.success("Saved");
    else toast.error(res.error);
    setSubmitting(false);
  });

  const body = watch("body");

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      <label className="block">
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Eyebrow</span>
        <input className={field} {...register("eyebrow")} />
      </label>
      <div>
        <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Image</span>
        <Controller control={control} name="image" render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />} />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold">Body (Markdown)</span>
          <AdminButton type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
            {preview ? "Edit" : "Preview"}
          </AdminButton>
        </div>
        {preview ? (
          <div className="rounded-xl border border-brand-blush bg-white p-5 min-h-[16rem]">
            <MarkdownPreview body={body} />
          </div>
        ) : (
          <textarea className={`${field} font-mono`} rows={16} {...register("body")} />
        )}
        {errors.body && <span className="text-xs text-brand-pink">{errors.body.message}</span>}
      </div>
      <AdminButton type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</AdminButton>
    </form>
  );
}
