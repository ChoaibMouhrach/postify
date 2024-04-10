import { z } from "zod";

export const updateCustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  address: z.string(),
  phone: z.string().min(8),
  email: z.union([z.undefined(), z.literal(""), z.string().email()]),
});
