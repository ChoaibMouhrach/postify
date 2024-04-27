import validator from "validator";
import { z } from "zod";

export const updateSupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  phone: z
    .string()
    .min(3)
    .refine(validator.isMobilePhone, "Invalid phone number"),
  address: z.string(),
  email: z.union([z.literal(""), z.string().email()]),
});

export const createSupplierSchema = z.object({
  name: z.string().min(3),
  phone: z
    .string()
    .min(3)
    .refine(validator.isMobilePhone, "Invalid phone number"),
  email: z.union([z.literal(""), z.string().email()]),
  address: z.string(),
});
