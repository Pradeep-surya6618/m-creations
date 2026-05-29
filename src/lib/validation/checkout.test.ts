import { describe, it, expect } from "vitest";
import { checkoutSchema } from "./checkout";

const valid = {
  name: "Surya",
  phone: "9876543210",
  addressLine1: "12 Flower St",
  city: "Madurai",
  state: "Tamil Nadu",
  pincode: "625001",
};

describe("checkoutSchema", () => {
  it("accepts a valid address", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts an optional empty addressLine2", () => {
    expect(checkoutSchema.safeParse({ ...valid, addressLine2: "" }).success).toBe(true);
  });
  it("rejects a bad phone", () => {
    expect(checkoutSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, phone: "1234567890" }).success).toBe(false);
  });
  it("rejects a bad pincode", () => {
    expect(checkoutSchema.safeParse({ ...valid, pincode: "12" }).success).toBe(false);
  });
  it("rejects a missing name", () => {
    expect(checkoutSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});
