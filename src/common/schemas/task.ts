import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  typeId: z.string().uuid("Select a type"),
  statusId: z.string().uuid("Select a status"),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  typeId: z.string().uuid("Select a type"),
  statusId: z.string().uuid("Select a status"),
});
