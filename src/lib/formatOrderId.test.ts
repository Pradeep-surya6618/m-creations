import { describe, it, expect } from "vitest";
import { formatOrderId } from "./formatOrderId";

describe("formatOrderId", () => {
  it("offsets the sequence by 1000 so the first order is MC1001", () => {
    expect(formatOrderId(1)).toBe("MC1001");
    expect(formatOrderId(24)).toBe("MC1024");
    expect(formatOrderId(1000)).toBe("MC2000");
  });
});
