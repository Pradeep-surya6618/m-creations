import { describe, it, expect } from "vitest";
import { ObjectId } from "mongodb";
import { mapProductDoc, mapCategoryDoc } from "./mapProductDoc";
import type { ProductDoc, CategoryDoc } from "@/types/catalog";

const img1 = new ObjectId();
const img2 = new ObjectId();

const productDoc: ProductDoc = {
  _id: new ObjectId(),
  productId: "mc-p-001",
  slug: "rose-garden-bouquet",
  name: "Rose Garden Bouquet",
  category: "bouquets",
  price: 499,
  images: [img1, img2],
  shortDescription: "A dozen handmade pipe-cleaner roses.",
  handmadeDetails: ["12 roses", "Satin ribbon"],
  stock: 8,
  featured: true,
  createdAt: new Date("2026-04-02T10:00:00.000Z"),
  updatedAt: new Date("2026-04-02T10:00:00.000Z"),
};

describe("mapProductDoc", () => {
  it("turns image ObjectIds into /api/images/<hex> URLs", () => {
    const p = mapProductDoc(productDoc);
    expect(p.images).toEqual([
      `/api/images/${img1.toHexString()}`,
      `/api/images/${img2.toHexString()}`,
    ]);
  });
  it("preserves all scalar fields", () => {
    const p = mapProductDoc(productDoc);
    expect(p.id).toBe("mc-p-001");
    expect(p.slug).toBe("rose-garden-bouquet");
    expect(p.name).toBe("Rose Garden Bouquet");
    expect(p.category).toBe("bouquets");
    expect(p.price).toBe(499);
    expect(p.stock).toBe(8);
    expect(p.featured).toBe(true);
  });
  it("serializes createdAt as ISO", () => {
    expect(mapProductDoc(productDoc).createdAt).toBe(
      "2026-04-02T10:00:00.000Z"
    );
  });
  it("handles a missing-image product (empty array)", () => {
    const p = mapProductDoc({ ...productDoc, images: [] });
    expect(p.images).toEqual([]);
  });
});

describe("mapCategoryDoc", () => {
  it("turns image ObjectId into URL; null → empty string", () => {
    const id = new ObjectId();
    const cat: CategoryDoc = {
      _id: new ObjectId(),
      slug: "bouquets",
      name: "Handmade Bouquets",
      description: "Hand-tied bouquets.",
      image: id,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(mapCategoryDoc(cat).image).toBe(`/api/images/${id.toHexString()}`);
    expect(mapCategoryDoc({ ...cat, image: null }).image).toBe("");
  });
});
