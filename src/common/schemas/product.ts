import { z } from "zod";

export const createProductSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  unit: z.string().min(1),
  tax: z.union([z.literal(""), z.number().gt(0)]),

  // optional
  description: z.string(),
  categoryId: z.union([
    z.undefined(),
    z.literal("").transform(() => undefined),
    z.string().uuid(),
  ]),
  code: z.string(),
});

export const updateProductSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().min(3),
  price: z.number().gte(1),
  unit: z.string().min(1),
  tax: z.union([z.literal(""), z.number().gt(0)]),

  // optional
  description: z.string(),
  categoryId: z.union([
    z.undefined(),
    z.literal("").transform(() => undefined),
    z.string().uuid(),
  ]),
  code: z.string(),
});
