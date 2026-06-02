import { describe, it, expect } from "vitest";
import { aboutSchema, heroSchema } from "./content";

describe("aboutSchema", () => {
  it("accepts valid", () => {
    expect(aboutSchema.safeParse({ body: "## Hello", image: null, eyebrow: "Our Story" }).success).toBe(true);
  });
  it("rejects empty body", () => {
    expect(aboutSchema.safeParse({ body: "", image: null, eyebrow: "" }).success).toBe(false);
  });
});
describe("heroSchema", () => {
  it("accepts valid", () => {
    expect(heroSchema.safeParse({
      image: null, eyebrow: "X", tagline: "T", badgeLabel: "L", badgeText: "B",
    }).success).toBe(true);
  });
  it("rejects empty tagline", () => {
    expect(heroSchema.safeParse({
      image: null, eyebrow: "X", tagline: "", badgeLabel: "L", badgeText: "B",
    }).success).toBe(false);
  });
});
