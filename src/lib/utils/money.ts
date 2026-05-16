import type { DiscountType } from "@/types/database";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

type CalculateFinalMonthlyFeeInput = {
  assignedMonthlyFee: number;
  discountType: DiscountType;
  discountValue: number;
};

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function calculateFinalMonthlyFee({
  assignedMonthlyFee,
  discountType,
  discountValue,
}: CalculateFinalMonthlyFeeInput) {
  if (discountType === "percentage") {
    return Math.max(0, roundMoney(assignedMonthlyFee * (1 - discountValue / 100)));
  }

  if (discountType === "fixed") {
    return Math.max(0, roundMoney(assignedMonthlyFee - discountValue));
  }

  return roundMoney(assignedMonthlyFee);
}

export function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}
