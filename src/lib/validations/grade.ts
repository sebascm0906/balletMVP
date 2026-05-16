import { z } from "zod";

export const gradeSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    description: z.string().trim().optional(),
    suggestedMinAge: z.coerce.number().int().min(0).optional(),
    suggestedMaxAge: z.coerce.number().int().min(0).optional(),
    baseMonthlyFee: z.coerce.number().min(0, "La mensualidad no puede ser negativa."),
  })
  .refine(
    (data) =>
      data.suggestedMinAge === undefined ||
      data.suggestedMaxAge === undefined ||
      data.suggestedMinAge <= data.suggestedMaxAge,
    {
      message: "La edad mínima no puede ser mayor que la máxima.",
      path: ["suggestedMinAge"],
    },
  );

export type GradeInput = z.infer<typeof gradeSchema>;
