import type { ObjectId } from "mongodb";

export type ProductDoc = {
  _id: ObjectId;
  productId: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  images: ObjectId[];
  shortDescription: string;
  handmadeDetails: string[];
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryDoc = {
  _id: ObjectId;
  slug: string;
  name: string;
  description: string;
  image: ObjectId | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ImageDoc = {
  _id: ObjectId;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: Date;
};

export type ContentDoc = {
  _id: string; // "about" | "hero"
  body?: string;
  image?: ObjectId;
  fields?: Record<string, string>;
  updatedAt: Date;
};
