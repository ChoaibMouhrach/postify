"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { action, adminAuth } from "../lib/action";
import { createTaskSchema, updateTaskSchema } from "@/common/schemas/task";
import { TaskRepo } from "../repositories/task";

export const createTaskAction = action
  .schema(createTaskSchema)
  .action(async ({ parsedInput }) => {
    const user = await adminAuth();

    const task = await TaskRepo.findTypeOrThrow(parsedInput.typeId);

    await TaskRepo.create([
      {
        ...parsedInput,
        userId: user.id,
      },
    ]);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath(`/tasks/${task.id}/edit`);
  });

export const updateTaskAction = action
  .schema(updateTaskSchema)
  .action(async ({ parsedInput }) => {
    const user = await adminAuth();

    const task = await TaskRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    if (task.data.typeId !== parsedInput.typeId) {
      await TaskRepo.findTypeOrThrow(parsedInput.typeId);
    }

    await TaskRepo.update(
      {
        id: parsedInput.id,
        userId: user.id,
      },
      parsedInput,
    );

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${task.data.id}/edit`);
  });

const schema = z.object({
  id: z.string().uuid(),
});

export const removeTaskAction = action
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const user = await adminAuth();

    const task = await TaskRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    if (task.data.deletedAt) {
      await task.permRemove();
    } else {
      await task.remove();
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath(`/tasks/${task.data.id}/edit`);
  });

export const restoreTaskAction = action
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const user = await adminAuth();

    const task = await TaskRepo.findOrThrow({
      id: parsedInput.id,
      userId: user.id,
    });

    if (!task.data.deletedAt) {
      return;
    }

    await task.restore();
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${task.data.id}/edit`);
  });
