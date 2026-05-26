import { describe, it, expect } from "vitest";
import { sortProducts, type SortKey } from "./sortProducts";
import type { Product } from "@/types/product";

const sample: Product[] = [
  { id: "1", slug: "a", name: "A", category: "bouquets", price: 200, images: [], shortDescription: "", handmadeDetails: [], stock: 1, featured: false, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "2", slug: "b", name: "B", category: "bouquets", price: 100, images: [], shortDescription: "", handmadeDetails: [], stock: 1, featured: true,  createdAt: "2026-02-01T00:00:00.000Z" },
  { id: "3", slug: "c", name: "C", category: "bouquets", price: 300, images: [], shortDescription: "", handmadeDetails: [], stock: 1, featured: false, createdAt: "2026-03-01T00:00:00.000Z" },
];

describe("sortProducts", () => {
  it("featured: featured items first, then by createdAt desc", () => {
    expect(sortProducts(sample, "featured").map((p) => p.id)).toEqual(["2", "3", "1"]);
  });
  it("price-asc: ascending price", () => {
    expect(sortProducts(sample, "price-asc").map((p) => p.id)).toEqual(["2", "1", "3"]);
  });
  it("price-desc: descending price", () => {
    expect(sortProducts(sample, "price-desc").map((p) => p.id)).toEqual(["3", "1", "2"]);
  });
  it("newest: by createdAt desc", () => {
    expect(sortProducts(sample, "newest").map((p) => p.id)).toEqual(["3", "2", "1"]);
  });
  it("does not mutate the input", () => {
    const before = sample.map((p) => p.id);
    sortProducts(sample, "price-desc");
    expect(sample.map((p) => p.id)).toEqual(before);
  });
  it("falls back to featured for unknown sort key", () => {
    expect(sortProducts(sample, "garbage" as SortKey).map((p) => p.id)).toEqual(["2", "3", "1"]);
  });
});
