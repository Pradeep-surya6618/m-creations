import { ObjectId, type Filter } from "mongodb";
import { getDb } from "./mongodb";
import type { ContentDoc } from "@/types/catalog";

async function col() {
  return (await getDb()).collection<ContentDoc>("content");
}

/** Public shape — image is a URL, never an ObjectId. */
export type AboutContent = {
  body: string;
  image: string | null;
  eyebrow: string;
};
export type HeroContent = {
  image: string | null;
  eyebrow: string;
  tagline: string;
  badgeLabel: string;
  badgeText: string;
};

function toUrl(id: ObjectId | string | undefined): string | null {
  if (!id) return null;
  const hex = typeof id === "string" ? id : id.toHexString();
  return `/api/images/${hex}`;
}

export async function getAboutContent(): Promise<AboutContent> {
  const doc = await (await col()).findOne({ _id: "about" } as Filter<ContentDoc>);
  return {
    body: doc?.body ?? "",
    image: toUrl(doc?.image),
    eyebrow: doc?.fields?.eyebrow ?? "",
  };
}

export async function getHeroContent(): Promise<HeroContent> {
  const doc = await (await col()).findOne({ _id: "hero" } as Filter<ContentDoc>);
  return {
    image: toUrl(doc?.image),
    eyebrow: doc?.fields?.eyebrow ?? "Est. Udumalpet · Handmade",
    tagline:
      doc?.fields?.tagline ??
      "Handmade flowers crafted with love — one petal at a time, made just for you.",
    badgeLabel: doc?.fields?.badgeLabel ?? "New Arrival",
    badgeText: doc?.fields?.badgeText ?? "Spring Bouquets",
  };
}

/** Admin-only write helpers (used by Task 26 actions). */
export async function upsertAboutContent(input: {
  body: string;
  image: string | null;
  eyebrow: string;
}): Promise<void> {
  const c = await col();
  await c.updateOne(
    { _id: "about" } as Filter<ContentDoc>,
    {
      $set: {
        body: input.body,
        image: input.image ? new ObjectId(input.image) : undefined,
        fields: { eyebrow: input.eyebrow },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
export async function upsertHeroContent(input: {
  image: string | null;
  eyebrow: string;
  tagline: string;
  badgeLabel: string;
  badgeText: string;
}): Promise<void> {
  const c = await col();
  await c.updateOne(
    { _id: "hero" } as Filter<ContentDoc>,
    {
      $set: {
        image: input.image ? new ObjectId(input.image) : undefined,
        fields: {
          eyebrow: input.eyebrow,
          tagline: input.tagline,
          badgeLabel: input.badgeLabel,
          badgeText: input.badgeText,
        },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
