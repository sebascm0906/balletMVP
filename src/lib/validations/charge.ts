import { z } from "zod";

export const generateMonthlyChargesSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export type GenerateMonthlyChargesInput = z.infer<typeof generateMonthlyChargesSchema>;
