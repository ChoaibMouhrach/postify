import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { tasksTable, taskTypes, TTask, TTaskInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { Repo } from "./repo";

export class TaskRepo extends Repo<TTask> {
  public static async find(where: {
    id: string;
    userId: string;
  }): Promise<TaskRepo | null> {
    const task = await db.query.tasksTable.findFirst({
      where: and(
        eq(tasksTable.id, where.id),
        eq(tasksTable.userId, where.userId),
      ),
    });

    return task ? new this(task) : null;
  }

  public static async findOrThrow(where: {
    id: string;
    userId: string;
  }): Promise<TaskRepo> {
    const task = await this.find(where);

    if (!task) {
      throw new NotfoundError("Task");
    }

    return task;
  }

  public static async findType(id: string) {
    return db.query.taskTypes.findFirst({
      where: eq(taskTypes.id, id),
    });
  }

  public static async findTypeOrThrow(id: string) {
    const type = await this.findType(id);

    if (!type) {
      throw new NotfoundError("Task type");
    }

    return type;
  }

  public static async create(input: TTaskInsert[]): Promise<TaskRepo[]> {
    const tasks = await db.insert(tasksTable).values(input).returning();
    return tasks.map((task) => new this(task));
  }

  public static async update(
    where: {
      id: string;
      userId: string;
    },
    input: Partial<TTaskInsert>,
  ): Promise<void> {
    await db
      .update(tasksTable)
      .set(input)
      .where(
        and(eq(tasksTable.id, where.id), eq(tasksTable.userId, where.userId)),
      );
  }

  public static async remove(where: {
    id: string;
    userId: string;
  }): Promise<void> {
    await db
      .update(tasksTable)
      .set({
        deletedAt: `NOW()`,
      })
      .where(
        and(eq(tasksTable.id, where.id), eq(tasksTable.userId, where.userId)),
      );
  }

  public static async restore(where: {
    id: string;
    userId: string;
  }): Promise<void> {
    await db
      .update(tasksTable)
      .set({
        deletedAt: null,
      })
      .where(
        and(eq(tasksTable.id, where.id), eq(tasksTable.userId, where.userId)),
      );
  }

  public static async permRemove(where: {
    id: string;
    userId: string;
  }): Promise<void> {
    await db
      .delete(tasksTable)
      .where(
        and(eq(tasksTable.id, where.id), eq(tasksTable.userId, where.userId)),
      );
  }

  public async restore() {
    return TaskRepo.restore({
      userId: this.data.userId,
      id: this.data.id,
    });
  }

  public async permRemove() {
    return TaskRepo.permRemove({
      userId: this.data.userId,
      id: this.data.id,
    });
  }

  public async remove() {
    return TaskRepo.remove({
      userId: this.data.userId,
      id: this.data.id,
    });
  }
}
