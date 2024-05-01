import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { TNotificationInsert, notifications } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = (id: string, userId: string) => {
  return db.query.notifications.findFirst({
    where: and(eq(notifications.userId, userId), eq(notifications.id, id)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const notification = await find(id, userId);

  if (!notification) {
    throw new NotfoundError("Notification");
  }

  return notification;
};

const create = async (input: TNotificationInsert) => {
  const notification = await db.insert(notifications).values(input).returning({
    id: notifications.id,
  });

  return notification[0];
};

const update = async (
  id: string,
  userId: string,
  input: Partial<TNotificationInsert>,
) => {
  return db
    .update(notifications)
    .set(input)
    .where(and(eq(notifications.userId, userId), eq(notifications.id, id)));
};

const markAll = (userId: string) => {
  return db
    .update(notifications)
    .set({
      read: true,
    })
    .where(eq(notifications.userId, userId));
};

export const notificationRepository = {
  find,
  findOrThrow,
  create,
  update,
  markAll,
};
