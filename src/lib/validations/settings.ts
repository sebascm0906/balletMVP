import { z } from "zod";

export const appSettingsSchema = z.object({
  academyName: z.string().trim().min(1, "El nombre de la academia es obligatorio."),
  logoPath: z.string().trim().optional(),
  primaryColor: z.string().trim().optional(),
  secondaryColor: z.string().trim().optional(),
  paymentDueDay: z.coerce.number().int().min(1).max(28),
  enrollmentFeeEnabled: z.boolean(),
  enrollmentFeeAmount: z.coerce.number().min(0),
  receiptPrefix: z.string().trim().min(1),
  studentFolioPrefix: z.string().trim().min(1),
});

export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
