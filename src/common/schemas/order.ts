import { z } from "zod";

export const createOrderSchema = z.object({
  //
});

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
});
