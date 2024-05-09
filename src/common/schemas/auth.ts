import { z } from "zod";

export const updateAuthSchema = z.object({
  name: z.string(),
});
