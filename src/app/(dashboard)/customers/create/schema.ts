import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(3),
  address: z.string(),
  phone: z.string().min(8),
  email: z.union([
    z.undefined(),
    z.literal("").transform(() => undefined),
    z.string().email(),
  ]),
});
