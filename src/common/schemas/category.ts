import { z } from "zod";

export const createCategorySchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(1),
});

export const updateCategorySchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().min(1),
});
