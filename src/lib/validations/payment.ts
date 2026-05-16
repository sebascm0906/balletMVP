import { z } from "zod";

export const paymentSchema = z.object({
  chargeId: z.string().uuid(),
  studentId: z.string().uuid(),
  amount: z.coerce.number().positive("El monto debe ser mayor a cero."),
  method: z.enum(["efectivo", "transferencia", "tarjeta", "deposito", "otro"]),
  paidAt: z.string().min(1, "La fecha de pago es obligatoria."),
  notes: z.string().trim().optional(),
});

export const cancelPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.string().trim().min(1, "El motivo de cancelación es obligatorio."),
});

export const paymentProofSchema = z.object({
  paymentId: z.string().uuid(),
  studentId: z.string().uuid(),
  originalName: z.string().trim().min(1),
  contentType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  size: z.number().max(5 * 1024 * 1024, "El archivo no debe exceder 5 MB."),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
