import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  TNotification,
  TNotificationInsert,
  notificationsTable,
} from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./business";

export class NotificationRepo extends Repo<TNotification> {
  public static async find(where: {
    id: string;
    userId: string;
  }): Promise<NotificationRepo | null> {
    const notification = await db.query.notificationsTable.findFirst({
      where: and(
        eq(notificationsTable.userId, where.userId),
        eq(notificationsTable.id, where.id),
      ),
    });

    return notification ? new this(notification) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    userId: string;
  }): Promise<NotificationRepo> {
    const notification = await this.find(where);

    if (!notification) {
      throw new NotfoundError("Notification");
    }

    return notification;
  }

  public static async create(
    input: TNotificationInsert,
  ): Promise<NotificationRepo[]> {
    const notifications = await db
      .insert(notificationsTable)
      .values(input)
      .returning();

    return notifications.map((notification) => new this(notification));
  }

  public static async update(
    where: {
      id: string;
      userId: string;
    },
    input: Partial<TNotificationInsert>,
  ): Promise<void> {
    await db
      .update(notificationsTable)
      .set(input)
      .where(
        and(
          eq(notificationsTable.userId, where.userId),
          eq(notificationsTable.id, where.id),
        ),
      );
  }

  public static async markAll(userId: string): Promise<void> {
    await db
      .update(notificationsTable)
      .set({
        read: true,
      })
      .where(eq(notificationsTable.userId, userId));
  }
}
