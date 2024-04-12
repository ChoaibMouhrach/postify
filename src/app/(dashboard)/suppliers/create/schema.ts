import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(3),

  email: z.union([z.literal(""), z.string().email()]),

  address: z.string(),
});
