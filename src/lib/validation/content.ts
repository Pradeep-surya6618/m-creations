import { z } from "zod";

const objectIdOrNull = z.string().regex(/^[a-f\d]{24}$/i).nullable();

export const aboutSchema = z.object({
  body: z.string().trim().min(1, "Body is required.").max(10_000),
  image: objectIdOrNull,
  eyebrow: z.string().trim().max(80),
  /** First-name of the maker — appears in the "Made by ___" eyebrow above the
      maker section on both the about page and the home brand-story block. */
  makerName: z.string().trim().max(60),
  /** Markdown shown in the "Meet the maker" block on /about and reused as the
      right-side body of the home page brand-story section. */
  makerStory: z.string().trim().max(2_000),
});
export type AboutInput = z.infer<typeof aboutSchema>;

export const heroSchema = z.object({
  image: objectIdOrNull,
  eyebrow: z.string().trim().min(1).max(80),
  tagline: z.string().trim().min(1).max(200),
  badgeLabel: z.string().trim().max(40),
  badgeText: z.string().trim().max(40),
});
export type HeroInput = z.infer<typeof heroSchema>;
