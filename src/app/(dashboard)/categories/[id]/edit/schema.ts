import { z } from "zod";

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});
