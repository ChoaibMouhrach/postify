"use server";

import { z } from "zod";
import { protectedAction } from "../lib/action";
import { NotificationRepo } from "../repositories/notification";
import { pageSchema } from "@/common/schemas";
import { db } from "../db";
import { notificationsTable } from "../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { RECORDS_LIMIT } from "@/common/constants";

const indexSchema = z.object({
  page: pageSchema,
});

export const getNotificationsAction = protectedAction
  .schema(indexSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const where = eq(notificationsTable.userId, authUser.id);

    const dataPromise = db.query.notificationsTable.findMany({
      where,
      limit: RECORDS_LIMIT,
      offset: (parsedInput.page - 1) * RECORDS_LIMIT,
      orderBy: desc(notificationsTable.createdAt),
    });

    const countPromise = db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(notificationsTable)
      .where(where);

    const [data, [{ count }]] = await Promise.all([dataPromise, countPromise]);

    const lastPage = Math.ceil(count / RECORDS_LIMIT);

    return {
      data,
      page: parsedInput.page,
      lastPage,
    };
  });

const markAsReadSchema = z.object({
  id: z.string().uuid(),
});

export const markAsReadAction = protectedAction
  .schema(markAsReadSchema)
  .action(async ({ parsedInput, ctx: { authUser } }) => {
    const notification = await NotificationRepo.findOrThrow({
      id: parsedInput.id,
      userId: authUser.id,
    });

    notification.data.read = true;

    await notification.save();
  });

export const markAllAsReadAction = protectedAction
  .schema(z.object({}))
  .action(async ({ ctx: { authUser } }) => {
    await NotificationRepo.readAll({
      userId: authUser.id,
    });
  });
