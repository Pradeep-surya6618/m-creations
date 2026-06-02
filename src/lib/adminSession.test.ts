import { describe, it, expect, beforeAll } from "vitest";
import { signAdminToken, verifyAdminToken } from "./adminSession";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-at-least-32-chars-long-okay";
});

describe("adminSession", () => {
  it("round-trips a signed token", async () => {
    const token = await signAdminToken("admin@example.com");
    const payload = await verifyAdminToken(token);
    expect(payload?.sub).toBe("admin@example.com");
  });
  it("rejects a tampered token", async () => {
    const token = await signAdminToken("admin@example.com");
    const tampered = token.slice(0, -2) + (token.endsWith("a") ? "b" : "a");
    expect(await verifyAdminToken(tampered)).toBeNull();
  });
  it("rejects garbage", async () => {
    expect(await verifyAdminToken("not.a.token")).toBeNull();
    expect(await verifyAdminToken("")).toBeNull();
  });
});
