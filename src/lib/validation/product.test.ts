import { describe, it, expect } from "vitest";
import { productSchema } from "./product";

const valid = {
  name: "Rose Garden Bouquet",
  slug: "rose-garden-bouquet",
  category: "bouquets",
  price: 499,
  stock: 8,
  featured: true,
  shortDescription: "A dozen handmade pipe-cleaner roses.",
  handmadeDetails: ["12 roses", "Satin ribbon"],
  images: [],
};

describe("productSchema", () => {
  it("accepts valid input", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects empty name", () => {
    expect(productSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
  it("rejects non-kebab slug", () => {
    expect(productSchema.safeParse({ ...valid, slug: "Rose Bouquet" }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, slug: "rose_bouquet" }).success).toBe(false);
  });
  it("rejects negative price/stock", () => {
    expect(productSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, stock: -1 }).success).toBe(false);
  });
  it("accepts up to 6 image IDs", () => {
    const six = Array.from({ length: 6 }, () => "507f1f77bcf86cd799439011");
    expect(productSchema.safeParse({ ...valid, images: six }).success).toBe(true);
  });
  it("rejects 7+ images", () => {
    const seven = Array.from({ length: 7 }, () => "507f1f77bcf86cd799439011");
    expect(productSchema.safeParse({ ...valid, images: seven }).success).toBe(false);
  });
  it("rejects malformed ObjectId hex", () => {
    expect(
      productSchema.safeParse({ ...valid, images: ["nope"] }).success
    ).toBe(false);
  });
});
