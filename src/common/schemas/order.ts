import { z } from "zod";

export const createOrderSchema = z.object({
  businessId: z.string().uuid(),
  note: z.string(),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),

  shippingAddress: z.union([z.literal(""), z.string().min(3)]),

  customerId: z.union([
    z.literal(""),
    z.string().uuid("Customer is not selected"),
  ]),
});

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  note: z.string(),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),

  shippingAddress: z.union([z.literal(""), z.string().min(3)]),

  customerId: z.union([
    z.literal(""),
    z.string().uuid("Customer is not selected"),
  ]),
});
