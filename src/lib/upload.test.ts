import { describe, it, expect } from "vitest";
import { isAllowedImage, MAX_UPLOAD_BYTES } from "./upload";

describe("isAllowedImage", () => {
  it("accepts a jpeg under the limit", () => {
    expect(isAllowedImage("image/jpeg", 1_000_000).ok).toBe(true);
  });
  it("accepts png and webp", () => {
    expect(isAllowedImage("image/png", 500).ok).toBe(true);
    expect(isAllowedImage("image/webp", 500).ok).toBe(true);
  });
  it("rejects a non-image type", () => {
    expect(isAllowedImage("application/pdf", 500).ok).toBe(false);
  });
  it("rejects a file over 2MB", () => {
    expect(isAllowedImage("image/jpeg", MAX_UPLOAD_BYTES + 1).ok).toBe(false);
  });
  it("rejects an empty file", () => {
    expect(isAllowedImage("image/jpeg", 0).ok).toBe(false);
  });
});
