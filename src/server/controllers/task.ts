"use server";

import { z } from "zod";
import { action, auth } from "../lib/action";
import { taskRepository } from "../repositories/task";
import { revalidatePath } from "next/cache";
import { createTaskSchema, updateTaskSchema } from "@/common/schemas/task";

export const createTaskAction = action(createTaskSchema, async (input) => {
  const user = await auth();

  const task = await taskRepository.findTypeOrThrow(input.typeId);

  await taskRepository.create({
    ...input,
    userId: user.id,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/tasks/${task.id}/edit`);
});

export const updateTaskAction = action(updateTaskSchema, async (input) => {
  const user = await auth();

  const task = await taskRepository.findOrThrow(input.id, user.id);

  if (task.typeId !== input.typeId) {
    await taskRepository.findTypeOrThrow(input.typeId);
  }

  await taskRepository.update(input.id, user.id, input);

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${task.id}/edit`);
});

const schema = z.object({
  id: z.string().uuid(),
});

export const removeTaskAction = action(schema, async (input) => {
  const user = await auth();

  const task = await taskRepository.findOrThrow(input.id, user.id);

  if (task.deletedAt) {
    await taskRepository.permRemove(input.id, user.id);
  } else {
    await taskRepository.remove(input.id, user.id);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/tasks/${task.id}/edit`);
});

export const restoreTaskAction = action(schema, async (input) => {
  const user = await auth();

  const task = await taskRepository.findOrThrow(input.id, user.id);

  if (task.deletedAt) {
    await taskRepository.restore(input.id, user.id);

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${task.id}/edit`);
  }
});
