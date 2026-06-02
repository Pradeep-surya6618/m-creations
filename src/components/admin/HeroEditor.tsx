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

const field =
  "w-full rounded-xl border border-brand-blush bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink";

export function HeroEditor({ initial }: { initial: HeroInput }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, watch } = useForm<HeroInput>({
    resolver: zodResolver(heroSchema),
    defaultValues: initial,
  });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    const res = await updateHeroContent(data);
    if (res.ok) toast.success("Saved");
    else toast.error(res.error);
    setSubmitting(false);
  });

  const v = watch();

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Hero image</span>
          <Controller control={control} name="image" render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} />} />
        </div>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Eyebrow</span>
          <input className={field} {...register("eyebrow")} />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Tagline</span>
          <textarea className={field} rows={2} {...register("tagline")} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Badge label</span>
            <input className={field} {...register("badgeLabel")} />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.15em] text-brand-ink-muted font-bold mb-2">Badge text</span>
            <input className={field} {...register("badgeText")} />
          </label>
        </div>
        <AdminButton type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</AdminButton>
      </div>
      <div className="bg-brand-cream border border-brand-blush rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-ink-muted font-bold mb-3">Preview</p>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-brand-blush">
          {v.image ? (
            <Image src={`/api/images/${v.image}`} alt="" fill sizes="400px" unoptimized className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-brand-ink-muted text-xs">No image</div>
          )}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-2xl px-3 py-2 flex items-center gap-2 shadow-petal-md">
            <div className="h-7 w-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm">✿</div>
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-brand-pink-dark font-bold">{v.badgeLabel}</p>
              <p className="text-xs font-semibold">{v.badgeText}</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-brand-ink-muted font-bold">{v.eyebrow}</p>
        <p className="mt-3 text-sm text-brand-ink-muted leading-relaxed">{v.tagline}</p>
      </div>
    </form>
  );
}
