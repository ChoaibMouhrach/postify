import { isMobilePhone } from "validator";
import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(3),
  phone: z.string().refine(isMobilePhone),
  currency: z.string().min(1),
  email: z.union([
    z.literal("").transform(() => undefined),
    z.undefined(),
    z.string().email(),
  ]),
  address: z.union([
    z.literal("").transform(() => undefined),
    z.undefined(),
    z.string().min(3),
  ]),
});

export const updateBusinessSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  phone: z.string().refine(isMobilePhone),
  currency: z.string().min(1),
  email: z.union([
    z.literal("").transform(() => undefined),
    z.undefined(),
    z.string().email(),
  ]),
  address: z.union([
    z.literal("").transform(() => undefined),
    z.undefined(),
    z.string().min(3),
  ]),
});
