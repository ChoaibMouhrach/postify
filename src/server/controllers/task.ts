"use server";

import { z } from "zod";
import { adminAction, protectedAction } from "../lib/action";
import { createTaskSchema, updateTaskSchema } from "@/common/schemas/task";
import { TaskRepo } from "../repositories/task";
import { indexBaseSchema } from "@/common/schemas";
import { RECORDS_LIMIT } from "@/common/constants";
import { db } from "../db";
import {
  and,
  between,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { tasksTable } from "../db/schema";

export const getTasksAction = adminAction
  .schema(indexBaseSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const where = and(
      eq(tasksTable.userId, authUser.id),

      parsedInput.from && parsedInput.to
        ? between(
            tasksTable.createdAt,
            new Date(parseInt(parsedInput.from)).toISOString().slice(0, 10),
            new Date(parseInt(parsedInput.to)).toISOString().slice(0, 10),
          )
        : undefined,

      // trash
      parsedInput.trash
        ? isNotNull(tasksTable.deletedAt)
        : isNull(tasksTable.deletedAt),

      // search
      parsedInput.query
        ? or(
            ilike(tasksTable.title, `%${parsedInput.query}`),
            ilike(tasksTable.description, `%${parsedInput.query}`),
          )
        : undefined,
    );

    const dataPromise = db.query.tasksTable.findMany({
      where,
      with: {
        status: true,
        type: true,
      },
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
      orderBy: desc(tasksTable.createdAt),
    });

    const countPromise = db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(tasksTable)
      .where(where);

    const [data, [{ count }]] = await Promise.all([dataPromise, countPromise]);

    const lastPage = Math.ceil(count / RECORDS_LIMIT);

    return {
      data,
      query: parsedInput.query,
      trash: parsedInput.trash,
      from: parsedInput.from,
      to: parsedInput.to,

      // pagination
      page: parsedInput.page,
      lastPage,
    };
  });

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
