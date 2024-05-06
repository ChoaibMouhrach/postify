import { z } from "zod";

export const updatePurchaseSchema = z.object({
  businessId: z.string().uuid(),
  id: z.string().uuid(),
  supplierId: z.string().uuid("Supplier not selected"),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
        cost: z.number().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),
});

export const createPurchaseSchema = z.object({
  businessId: z.string().uuid(),
  supplierId: z.string().uuid("Supplier not selected"),
  products: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().gt(0),
        cost: z.number().gt(0),
      }),
    )
    .min(1, "At least one product is reauired"),
});
