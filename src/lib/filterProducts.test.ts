import { describe, it, expect } from "vitest";
import { filterProducts } from "./filterProducts";
import type { Product } from "@/types/product";

const sample: Product[] = [
  { id: "1", slug: "a", name: "A", category: "bouquets",    price: 100, images: [], shortDescription: "", handmadeDetails: [], stock: 1, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "2", slug: "b", name: "B", category: "candle-floral", price: 200, images: [], shortDescription: "", handmadeDetails: [], stock: 1, createdAt: "2026-01-02T00:00:00.000Z" },
  { id: "3", slug: "c", name: "C", category: "bouquets",    price: 300, images: [], shortDescription: "", handmadeDetails: [], stock: 1, createdAt: "2026-01-03T00:00:00.000Z" },
];

describe("filterProducts", () => {
  it("returns all products when no category given", () => {
    expect(filterProducts(sample).length).toBe(3);
    expect(filterProducts(sample, undefined).length).toBe(3);
    expect(filterProducts(sample, "all").length).toBe(3);
  });
  it("filters by a known category", () => {
    expect(filterProducts(sample, "bouquets").map((p) => p.id)).toEqual(["1", "3"]);
  });
  it("returns empty for an unknown category", () => {
    expect(filterProducts(sample, "nope")).toEqual([]);
  });
});
