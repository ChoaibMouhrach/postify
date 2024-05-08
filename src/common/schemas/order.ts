import { z } from "zod";

export const createOrderSchema = z.object({
  businessId: z.string().uuid(),
  customerId: z.string().uuid("Customer is not selected"),
  note: z.string(),
  shippingAddress: z.string().min(3),
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
  businessId: z.string().uuid(),
  id: z.string().uuid(),
  customerId: z.string().uuid("Customer is not selected"),
  note: z.string(),
  shippingAddress: z.string().min(3),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),
});
