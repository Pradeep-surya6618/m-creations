"use server";

import { requireAdminSession } from "@/lib/adminSession";
import { aboutSchema, heroSchema } from "@/lib/validation/content";
import { upsertAboutContent, upsertHeroContent } from "@/lib/content";

type Result = { ok: true } | { ok: false; error: string };

export async function updateAboutContent(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  await upsertAboutContent(parsed.data);
  return { ok: true };
}

export async function updateHeroContent(input: unknown): Promise<Result> {
  await requireAdminSession();
  const parsed = heroSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  await upsertHeroContent(parsed.data);
  return { ok: true };
}
