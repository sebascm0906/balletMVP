import { describe, expect, it } from "vitest";

import { calculateDashboardMetrics } from "@/lib/dashboard/metrics";

describe("calculateDashboardMetrics", () => {
  it("summarizes active records, current month collection and debts", () => {
    const metrics = calculateDashboardMetrics({
      students: [
        { id: "s1", status: "active" },
        { id: "s2", status: "active" },
        { id: "s3", status: "inactive" },
      ],
      groups: [
        { id: "g1", status: "active" },
        { id: "g2", status: "inactive" },
      ],
      charges: [
        {
          id: "c1",
          student_id: "s1",
          amount_due: 1000,
          amount_paid: 1000,
          status: "pagado",
        },
        {
          id: "c2",
          student_id: "s2",
          amount_due: 1200,
          amount_paid: 400,
          status: "parcial",
        },
        {
          id: "c3",
          student_id: "s1",
          amount_due: 900,
          amount_paid: 0,
          status: "vencido",
        },
      ],
      payments: [
        { amount: 1000, method: "efectivo" },
        { amount: 400, method: "transferencia" },
      ],
    });

    expect(metrics.activeStudents).toBe(2);
    expect(metrics.activeGroups).toBe(1);
    expect(metrics.monthlyCollected).toBe(1400);
    expect(metrics.monthlyPending).toBe(1700);
    expect(metrics.studentsWithDebt).toBe(2);
    expect(metrics.collectionRate).toBe(45.16);
    expect(metrics.paymentsByMethod).toEqual([
      { method: "efectivo", amount: 1000 },
      { method: "transferencia", amount: 400 },
    ]);
  });
});
