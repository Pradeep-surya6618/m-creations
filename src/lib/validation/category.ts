import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case."),
  description: z.string().trim().min(1).max(200),
  image: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
