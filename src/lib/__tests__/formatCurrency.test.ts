import { describe, it, expect } from "vitest";
import { formatCurrency } from "../formatCurrency";

describe("formatCurrency", () => {
  it('should format 0 as "Rp 0"', () => {
    expect(formatCurrency(0)).toBe("Rp 0");
  });

  it('should format small numbers without separator', () => {
    expect(formatCurrency(500)).toBe("Rp 500");
  });

  it('should format thousands with dot separator', () => {
    expect(formatCurrency(1000)).toBe("Rp 1.000");
  });

  it('should format millions correctly', () => {
    expect(formatCurrency(1000000)).toBe("Rp 1.000.000");
  });

  it('should format arbitrary amounts correctly', () => {
    expect(formatCurrency(65000)).toBe("Rp 65.000");
    expect(formatCurrency(130000)).toBe("Rp 130.000");
    expect(formatCurrency(1500750)).toBe("Rp 1.500.750");
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-5000)).toBe("Rp -5.000");
  });
});
