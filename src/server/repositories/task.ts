import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { tasks, taskTypes, TTaskInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = (id: string, userId: string) => {
  return db.query.tasks.findFirst({
    where: and(eq(tasks.id, id), eq(tasks.userId, userId)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const task = await find(id, userId);

  if (!task) {
    throw new NotfoundError("Task");
  }

  return task;
};

const findType = (id: string) => {
  return db.query.taskTypes.findFirst({
    where: eq(taskTypes.id, id),
  });
};

const findTypeOrThrow = async (id: string) => {
  const type = await findType(id);

  if (!type) {
    throw new NotfoundError("Task type");
  }

  return type;
};

const create = async (input: TTaskInsert) => {
  const ts = await db.insert(tasks).values(input).returning({
    id: tasks.id,
  });

  return ts[0].id;
};

const update = (id: string, userId: string, input: Partial<TTaskInsert>) => {
  return db
    .update(tasks)
    .set(input)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
};

const remove = (id: string, userId: string) => {
  return db
    .update(tasks)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(tasks)
    .set({
      deletedAt: null,
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
};

export const taskRepository = {
  find,
  findOrThrow,
  findType,
  findTypeOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
