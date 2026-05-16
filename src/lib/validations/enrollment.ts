import { z } from "zod";

export const enrollmentSchema = z.object({
  studentId: z.string().uuid(),
  groupId: z.string().uuid("Selecciona un grupo."),
  startsOn: z.string().min(1, "La fecha de inicio es obligatoria."),
  assignedMonthlyFee: z.coerce.number().min(0),
  discountType: z.enum(["none", "percentage", "fixed"]),
  discountValue: z.coerce.number().min(0),
});

export const changeGroupSchema = enrollmentSchema.extend({
  previousEnrollmentId: z.string().uuid(),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
