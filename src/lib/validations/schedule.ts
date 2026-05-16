import { z } from "zod";

export const scheduleSchema = z
  .object({
    groupId: z.string().uuid("Selecciona un grupo."),
    weekday: z.coerce.number().int().min(0).max(6),
    startsAt: z.string().min(1, "La hora de inicio es obligatoria."),
    endsAt: z.string().min(1, "La hora de finalización es obligatoria."),
  })
  .refine((data) => data.startsAt < data.endsAt, {
    message: "La hora de finalización debe ser posterior a la de inicio.",
    path: ["endsAt"],
  });

export type ScheduleInput = z.infer<typeof scheduleSchema>;
