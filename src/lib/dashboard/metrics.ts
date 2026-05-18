import type { ChargeStatus, PaymentMethod } from "@/types/database";

type StudentMetricRow = {
  id: string;
  status: "active" | "inactive";
};

type GroupMetricRow = {
  id: string;
  status: "active" | "inactive";
};

type ChargeMetricRow = {
  id: string;
  student_id: string;
  amount_due: number;
  amount_paid: number;
  status: ChargeStatus;
};

type PaymentMetricRow = {
  amount: number;
  method: PaymentMethod;
};

export type DashboardMetricsInput = {
  students: StudentMetricRow[];
  groups: GroupMetricRow[];
  charges: ChargeMetricRow[];
  payments: PaymentMetricRow[];
};

export type DashboardMetrics = {
  activeStudents: number;
  activeGroups: number;
  monthlyExpected: number;
  monthlyCollected: number;
  monthlyPending: number;
  overdueTotal: number;
  studentsWithDebt: number;
  collectionRate: number;
  paymentsByMethod: Array<{ method: PaymentMethod; amount: number }>;
};

export function calculateDashboardMetrics({
  students,
  groups,
  charges,
  payments,
}: DashboardMetricsInput): DashboardMetrics {
  const activeStudents = students.filter((student) => student.status === "active").length;
  const activeGroups = groups.filter((group) => group.status === "active").length;
  const monthlyExpected = roundMoney(
    charges
      .filter((charge) => charge.status !== "cancelado")
      .reduce((total, charge) => total + charge.amount_due, 0),
  );
  const monthlyCollected = roundMoney(
    payments.reduce((total, payment) => total + payment.amount, 0),
  );
  const monthlyPending = roundMoney(
    charges.reduce(
      (total, charge) =>
        charge.status === "cancelado"
          ? total
          : total + Math.max(0, charge.amount_due - charge.amount_paid),
      0,
    ),
  );
  const overdueTotal = roundMoney(
    charges
      .filter((charge) => charge.status === "vencido")
      .reduce((total, charge) => total + Math.max(0, charge.amount_due - charge.amount_paid), 0),
  );
  const studentsWithDebt = new Set(
    charges
      .filter(
        (charge) =>
          charge.status !== "cancelado" && charge.amount_due - charge.amount_paid > 0,
      )
      .map((charge) => charge.student_id),
  ).size;
  const collectionRate =
    monthlyExpected === 0 ? 0 : roundMoney((monthlyCollected / monthlyExpected) * 100);

  return {
    activeStudents,
    activeGroups,
    monthlyExpected,
    monthlyCollected,
    monthlyPending,
    overdueTotal,
    studentsWithDebt,
    collectionRate,
    paymentsByMethod: summarizePaymentsByMethod(payments),
  };
}

function summarizePaymentsByMethod(payments: PaymentMetricRow[]) {
  const totals = new Map<PaymentMethod, number>();

  for (const payment of payments) {
    totals.set(payment.method, roundMoney((totals.get(payment.method) ?? 0) + payment.amount));
  }

  return Array.from(totals.entries()).map(([method, amount]) => ({ method, amount }));
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
