import { z } from "zod";

export const createProductSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  description: z.string(),
});

export const updateProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  description: z.string(),
});
