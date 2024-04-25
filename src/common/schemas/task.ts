import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  typeId: z.string().uuid("Select a type"),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  typeId: z.string().uuid("Select a type"),
});
