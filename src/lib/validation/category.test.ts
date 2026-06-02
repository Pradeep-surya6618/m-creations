import { describe, it, expect } from "vitest";
import { categorySchema } from "./category";

const valid = {
  name: "Handmade Bouquets",
  slug: "bouquets",
  description: "Hand-tied.",
  image: null,
};

describe("categorySchema", () => {
  it("accepts valid", () => {
    expect(categorySchema.safeParse(valid).success).toBe(true);
  });
  it("rejects bad slug", () => {
    expect(categorySchema.safeParse({ ...valid, slug: "Bad Slug" }).success).toBe(false);
  });
  it("accepts an image ObjectId hex", () => {
    expect(
      categorySchema.safeParse({ ...valid, image: "507f1f77bcf86cd799439011" }).success
    ).toBe(true);
  });
});
