export type CategorySlug =
  | "bouquets"
  | "pipe-cleaner"
  | "flower-pots"
  | "gifts"
  | "candle-floral";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  images: string[];
  shortDescription: string;
  handmadeDetails: string[];
  stock: number;
  featured?: boolean;
  createdAt: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
};
