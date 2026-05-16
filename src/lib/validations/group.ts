import { z } from "zod";

export const groupSchema = z.object({
  gradeId: z.string().uuid("Selecciona un grado."),
  name: z.string().trim().min(1, "El nombre del grupo es obligatorio."),
  teacherName: z.string().trim().optional(),
  classroom: z.string().trim().optional(),
  capacity: z.coerce.number().int().positive("El cupo debe ser mayor a cero."),
});

export type GroupInput = z.infer<typeof groupSchema>;
