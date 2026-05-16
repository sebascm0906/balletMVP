import { z } from "zod";

export const optionalNumber = (schema: z.ZodType<number>) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    schema.optional(),
  );
