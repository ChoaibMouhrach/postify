import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().uuid("Customer is not selected"),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),
});

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid("Customer is not selected"),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),
});
