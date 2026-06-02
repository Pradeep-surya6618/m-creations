import { describe, it, expect } from "vitest";
import { loginSchema } from "./admin";

const valid = { email: "maria@example.com", password: "hunter22HUNTER22" };

describe("loginSchema", () => {
  it("accepts valid creds", () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects bad email", () => {
    expect(loginSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ ...valid, password: "" }).success).toBe(false);
  });
});
