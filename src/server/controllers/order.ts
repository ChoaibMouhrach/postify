import { z } from "zod";
import { action /* auth */ } from "../lib/action";
import { createOrderSchema, updateOrderSchema } from "@/common/schemas/order";

export const createOrderAction = action(createOrderSchema, async () => {
  // const user = await auth();
});

export const updateOrderAction = action(updateOrderSchema, async () => {
  // const user = await auth();
});

const schema = z.object({});

export const deleteOrderAction = action(schema, async () => {
  // const user = await auth();
});

export const resetOrderAction = action(schema, async () => {
  // const user = await auth();
});
