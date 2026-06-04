"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { heroSchema, type HeroInput } from "@/lib/validation/content";
import { updateHeroContent } from "@/actions/contentAdmin";
import { AdminButton } from "./AdminButton";
import { ImagePicker } from "./ImagePicker";
import {
  CharCount,
  Field,
  FormSection,
  fieldClasses,
} from "./AdminFormPrimitives";

// Hard caps from the zod schema.
const EYEBROW_MAX = 80;
const TAGLINE_MAX = 200;
const BADGE_MAX = 40;

export function HeroEditor({ initial }: { initial: HeroInput }) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<HeroInput>({
    resolver: zodResolver(heroSchema),
    defaultValues: initial,
  });

  const v = watch();
  const eyebrowLen = (v.eyebrow ?? "").length;
  const taglineLen = (v.tagline ?? "").length;
  const badgeLabelLen = (v.badgeLabel ?? "").length;
  const badgeTextLen = (v.badgeText ?? "").length;

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = await updateHeroContent(data);
    if (res.ok) toast.success("Saved");
    else toast.error(res.error);
    setSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* ── Left column: editor sections ────────────────────────────── */}
        <div className="space-y-6 min-w-0">
          <FormSection
            title="Image"
            subtitle="The right-side image on the home page hero."
          >
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImagePicker value={field.value} onChange={field.onChange} />
              )}
            />
          </FormSection>

          <FormSection
            title="Copy"
            subtitle="The eyebrow line above the title and the tagline below it."
          >
            <div className="space-y-5">
              <Field
                label="Eyebrow"
                error={errors.eyebrow?.message}
                rightSlot={<CharCount value={eyebrowLen} max={EYEBROW_MAX} />}
              >
                <input
                  className={fieldClasses(errors.eyebrow)}
                  maxLength={EYEBROW_MAX}
                  placeholder="Est. Udumalpet · Handmade"
                  {...register("eyebrow")}
                />
              </Field>
              <Field
                label="Tagline"
                error={errors.tagline?.message}
                rightSlot={<CharCount value={taglineLen} max={TAGLINE_MAX} />}
              >
                <textarea
                  className={`${fieldClasses(errors.tagline)} resize-y`}
                  rows={3}
                  maxLength={TAGLINE_MAX}
                  placeholder="Handmade flowers crafted with love — one petal at a time."
                  {...register("tagline")}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Badge"
            subtitle="Floating chip on top of the hero image."
          >
            <div className="grid grid-cols-2 gap-5">
              <Field
                label="Badge label"
                hint="Eyebrow text inside the chip."
                error={errors.badgeLabel?.message}
                rightSlot={<CharCount value={badgeLabelLen} max={BADGE_MAX} />}
              >
                <input
                  className={fieldClasses(errors.badgeLabel)}
                  maxLength={BADGE_MAX}
                  placeholder="New Arrival"
                  {...register("badgeLabel")}
                />
              </Field>
              <Field
                label="Badge text"
                hint="Headline inside the chip."
                error={errors.badgeText?.message}
                rightSlot={<CharCount value={badgeTextLen} max={BADGE_MAX} />}
              >
                <input
                  className={fieldClasses(errors.badgeText)}
                  maxLength={BADGE_MAX}
                  placeholder="Spring Bouquets"
                  {...register("badgeText")}
                />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* ── Right column: sticky live preview ──────────────────────── */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FormSection
            title="Preview"
            subtitle="What customers see on the home page."
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-blush">
              {v.image ? (
                <Image
                  src={`/api/images/${v.image}`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 400px, 80vw"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-brand-ink-muted text-xs">
                  No image
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-2xl px-3 py-2 flex items-center gap-2 shadow-petal-md">
                <div className="h-7 w-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm">
                  ✿
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-brand-pink-dark font-bold">
                    {v.badgeLabel || "Badge label"}
                  </p>
                  <p className="text-xs font-semibold">
                    {v.badgeText || "Badge text"}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted font-bold">
              {v.eyebrow || "Eyebrow"}
            </p>
            <p className="mt-3 text-sm text-brand-ink-muted leading-relaxed">
              {v.tagline || "Tagline"}
            </p>
          </FormSection>
        </aside>
      </div>

      <footer className="flex items-center gap-3 pt-2">
        <div className="ml-auto flex items-center gap-3">
          <AdminButton href="/admin/content" variant="ghost">
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </AdminButton>
        </div>
      </footer>
    </form>
  );
}
