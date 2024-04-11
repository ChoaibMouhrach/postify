import { z } from "zod";

export const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  description: z.string(),
});
