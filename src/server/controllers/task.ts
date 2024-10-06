"use server";

import { z } from "zod";
import { adminAction, protectedAction } from "../lib/action";
import { createTaskSchema, updateTaskSchema } from "@/common/schemas/task";
import { TaskRepo } from "../repositories/task";

export const createTaskAction = adminAction
  .schema(createTaskSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    await TaskRepo.findTypeOrThrow(parsedInput.typeId);

    await TaskRepo.create([
      {
        ...parsedInput,
        userId: authUser.id,
      },
    ]);
  });

export const updateTaskAction = adminAction
  .schema(updateTaskSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const task = await TaskRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    if (task.data.typeId !== parsedInput.typeId) {
      await TaskRepo.findTypeOrThrow(parsedInput.typeId);
    }

    await TaskRepo.update(
      {
        id: parsedInput.id,
        userId: authUser.id,
      },
      parsedInput,
    );
  });

const schema = z.object({
  id: z.string().uuid(),
});

export const removeTaskAction = protectedAction
  .schema(schema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const task = await TaskRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    if (task.data.deletedAt) {
      await task.permRemove();
      return;
    }

    await task.remove();
  });

export const restoreTaskAction = adminAction
  .schema(schema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const task = await TaskRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    if (!task.data.deletedAt) {
      return;
    }

    await task.restore();
  });
