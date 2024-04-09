import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().gte(1),
  description: z.string(),
});
