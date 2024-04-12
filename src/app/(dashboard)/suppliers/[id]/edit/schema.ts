import { z } from "zod";

export const updateSupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  phone: z.string().min(3),
  address: z.string(),
  email: z.union([z.literal(""), z.string().email()]),
});
