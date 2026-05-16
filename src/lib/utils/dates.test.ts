import { describe, expect, it } from "vitest";

import { calculateAge, getSpanishMonthName } from "@/lib/utils/dates";

describe("calculateAge", () => {
  it("calculates age after birthday in the reference year", () => {
    expect(calculateAge("2018-03-10", new Date("2026-05-16T12:00:00Z"))).toBe(8);
  });

  it("subtracts one year before birthday in the reference year", () => {
    expect(calculateAge("2018-12-10", new Date("2026-05-16T12:00:00Z"))).toBe(7);
  });
});

describe("getSpanishMonthName", () => {
  it("returns the Spanish month name for a 1-based month number", () => {
    expect(getSpanishMonthName(5)).toBe("mayo");
  });

  it("rejects invalid month numbers", () => {
    expect(() => getSpanishMonthName(13)).toThrow("Mes inválido");
  });
});
