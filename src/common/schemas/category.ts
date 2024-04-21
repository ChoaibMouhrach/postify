import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
});

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});
