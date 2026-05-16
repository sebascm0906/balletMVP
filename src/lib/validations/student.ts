import { z } from "zod";

export const studentSchema = z.object({
  fullName: z.string().trim().min(1, "El nombre es obligatorio."),
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  phone: z.string().trim().optional(),
  joinedAt: z.string().min(1, "La fecha de ingreso es obligatoria."),
  medicalNotes: z.string().trim().optional(),
  generalNotes: z.string().trim().optional(),
});

export const deactivateStudentSchema = z.object({
  studentId: z.string().uuid(),
  leftAt: z.string().min(1, "La fecha de baja es obligatoria."),
  leftReason: z.string().trim().min(1, "El motivo de baja es obligatorio."),
});

export type StudentInput = z.infer<typeof studentSchema>;
