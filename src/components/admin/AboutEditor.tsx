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
import {
  CharCount,
  Field,
  FormSection,
  fieldClasses,
} from "./AdminFormPrimitives";

// Hard caps come from the zod schema.
const EYEBROW_MAX = 80;
const BODY_MAX = 10_000;

export function AboutEditor({ initial }: { initial: AboutInput }) {
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AboutInput>({
    resolver: zodResolver(aboutSchema),
    defaultValues: initial,
  });

  const body = watch("body") ?? "";
  const eyebrowLen = (watch("eyebrow") ?? "").length;
  const bodyLen = body.length;
  const bodyOverMax = bodyLen > BODY_MAX;

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = await updateAboutContent(data);
    if (res.ok) toast.success("Saved");
    else toast.error(res.error);
    setSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <FormSection
        title="Header"
        subtitle="Short eyebrow text and the supporting image at the top of the About page."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Eyebrow"
            hint="Small line shown above the page title (optional)."
            error={errors.eyebrow?.message}
            rightSlot={<CharCount value={eyebrowLen} max={EYEBROW_MAX} />}
          >
            <input
              className={fieldClasses(errors.eyebrow)}
              maxLength={EYEBROW_MAX}
              placeholder="Our story"
              {...register("eyebrow")}
            />
          </Field>
          <Field label="Image" hint="Square image shown beside the body copy.">
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImagePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Body"
        subtitle="Long-form Markdown — supports headings, lists, links, and emphasis."
      >
        <Field
          label="Body (Markdown)"
          error={errors.body?.message}
          rightSlot={
            <div className="flex items-center gap-3">
              <CharCount value={bodyLen} max={BODY_MAX} />
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="text-[11px] font-bold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark cursor-pointer transition-colors"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
          }
        >
          {preview ? (
            <div className="rounded-xl border border-brand-blush bg-white p-5 min-h-[18rem]">
              <MarkdownPreview body={body} />
            </div>
          ) : (
            <textarea
              className={`${fieldClasses(errors.body)} font-mono resize-y`}
              rows={18}
              placeholder="# Our story&#10;&#10;Maria Creations began in a small workshop in Udumalpet…"
              {...register("body")}
            />
          )}
        </Field>
      </FormSection>

      <footer className="flex items-center gap-3 pt-2">
        <div className="ml-auto flex items-center gap-3">
          <AdminButton href="/admin/content" variant="ghost">
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={submitting || bodyOverMax}>
            {submitting ? "Saving…" : "Save"}
          </AdminButton>
        </div>
      </footer>
    </form>
  );
}
