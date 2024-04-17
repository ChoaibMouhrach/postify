import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotfoundError } from "../lib/action";
import { categories, TCategoryInsert } from "../db/schema";

const find = (id: string, userId: string) => {
  return db.query.categories.findFirst({
    where: and(eq(categories.id, id), eq(categories.userId, userId)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const category = await find(id, userId);

  if (!category) {
    throw new NotfoundError("Category");
  }

  return category;
};

const create = async (input: TCategoryInsert) => {
  return db.insert(categories).values(input);
};

const update = (
  id: string,
  userId: string,
  input: Partial<TCategoryInsert>,
) => {
  return db
    .update(categories)
    .set(input)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
};

const remove = (id: string, userId: string) => {
  return db
    .update(categories)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(categories)
    .set({
      deletedAt: null,
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
};

export const categoryRepository = {
  find,
  findOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
