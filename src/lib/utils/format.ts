import type { ChargeStatus, PaymentMethod, PaymentStatus } from "@/types/database";

export const chargeStatusLabels: Record<ChargeStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  parcial: "Parcial",
  vencido: "Vencido",
  cancelado: "Cancelado",
  becada: "Becada",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  active: "Activo",
  cancelled: "Cancelado",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  deposito: "Depósito",
  otro: "Otro",
};
