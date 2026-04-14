import { describe, it, expect } from "vitest";
import { calculateSubtotal } from "../calculateSubtotal";

describe("calculateSubtotal", () => {
  it("should return quantity × unitPrice for positive integers", () => {
    expect(calculateSubtotal(2, 65000)).toBe(130000);
  });

  it("should return 0 when quantity is 0", () => {
    expect(calculateSubtotal(0, 50000)).toBe(0);
  });

  it("should return 0 when unitPrice is 0", () => {
    expect(calculateSubtotal(5, 0)).toBe(0);
  });

  it("should handle single item correctly", () => {
    expect(calculateSubtotal(1, 25000)).toBe(25000);
  });

  it("should handle large quantities", () => {
    expect(calculateSubtotal(100, 15000)).toBe(1500000);
  });
});
