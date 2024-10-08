import { z } from "zod";

export const createProductSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  unit: z.string().min(1),
  tax: z.number(),

  // optional
  description: z.string(),
  code: z.string(),
  categoryId: z.union([
    z.undefined(),
    z.literal("").transform(() => undefined),
    z.string().uuid(),
  ]),
});

export const updateProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  unit: z.string().min(1),
  tax: z.number(),

  // optional
  description: z.string(),
  code: z.string(),
  categoryId: z.union([
    z.undefined(),
    z.literal("").transform(() => undefined),
    z.string().uuid(),
  ]),
});
