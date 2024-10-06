import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
});

export const updateAuthSchema = z.object({
  name: z.string(),
});
