import { z } from "zod";

const objectIdHex = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid image reference.");

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (lowercase, hyphens)."),
  category: z.string().trim().min(1, "Category is required."),
  price: z.number().int().min(0, "Price must be ≥ 0."),
  stock: z.number().int().min(0, "Stock must be ≥ 0."),
  featured: z.boolean().default(false),
  shortDescription: z.string().trim().min(1).max(200),
  handmadeDetails: z.array(z.string().trim().max(120)).max(10),
  images: z.array(objectIdHex).max(6, "Maximum of 6 images per product."),
});

export type ProductInput = z.infer<typeof productSchema>;
