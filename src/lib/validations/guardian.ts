import { z } from "zod";

export const guardianSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio."),
  phone: z.string().trim().min(1, "El teléfono es obligatorio."),
  email: z.string().trim().email("Ingresa un email válido.").optional().or(z.literal("")),
  address: z.string().trim().optional(),
});

export const studentGuardianSchema = z.object({
  studentId: z.string().uuid(),
  guardianId: z.string().uuid(),
  relationship: z.string().trim().min(1, "El parentesco es obligatorio."),
  isPrimary: z.boolean().default(false),
  isEmergencyContact: z.boolean().default(false),
});

export type GuardianInput = z.infer<typeof guardianSchema>;
