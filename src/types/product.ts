/**
 * Historical 5 brand categories; widened to `string` in Phase 3
 * when admin-created categories became possible.
 */
export type CategorySlug = string;

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  shortDescription: string;
  handmadeDetails: string[];
  stock: number;
  featured?: boolean;
  createdAt: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
};
