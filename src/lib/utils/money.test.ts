import { describe, expect, it } from "vitest";

import { calculateFinalMonthlyFee, formatCurrency } from "@/lib/utils/money";

describe("formatCurrency", () => {
  it("formats Mexican peso amounts", () => {
    expect(formatCurrency(1250)).toBe("$1,250.00");
  });
});

describe("calculateFinalMonthlyFee", () => {
  it("applies percentage discounts", () => {
    expect(
      calculateFinalMonthlyFee({
        assignedMonthlyFee: 1000,
        discountType: "percentage",
        discountValue: 15,
      }),
    ).toBe(850);
  });

  it("applies fixed discounts without going below zero", () => {
    expect(
      calculateFinalMonthlyFee({
        assignedMonthlyFee: 500,
        discountType: "fixed",
        discountValue: 800,
      }),
    ).toBe(0);
  });
});
