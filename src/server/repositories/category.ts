import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotfoundError } from "../lib/action";
import { categories, TCategoryInsert } from "../db/schema";
import { redirect } from "next/navigation";

const find = (id: string, businessId: string) => {
  return db.query.categories.findFirst({
    where: and(eq(categories.id, id), eq(categories.businessId, businessId)),
  });
};

const findOrThrow = async (id: string, businessId: string) => {
  const category = await find(id, businessId);

  if (!category) {
    throw new NotfoundError("Category");
  }

  return category;
};

const rscFindOrThrow = async (id: string, businessId: string) => {
  const category = await find(id, businessId);

  if (!category) {
    redirect(`/businesses/${businessId}/categories`);
  }

  return category;
};

const create = async (input: TCategoryInsert) => {
  return db.insert(categories).values(input);
};

const update = (
  id: string,
  businessId: string,
  input: Partial<TCategoryInsert>,
) => {
  return db
    .update(categories)
    .set(input)
    .where(and(eq(categories.id, id), eq(categories.businessId, businessId)));
};

const remove = (id: string, businessId: string) => {
  return db
    .update(categories)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(categories.id, id), eq(categories.businessId, businessId)));
};

const restore = (id: string, businessId: string) => {
  return db
    .update(categories)
    .set({
      deletedAt: null,
    })
    .where(and(eq(categories.id, id), eq(categories.businessId, businessId)));
};

const permRemove = (id: string, businessId: string) => {
  return db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.businessId, businessId)));
};

export const categoryRepository = {
  find,
  findOrThrow,
  rscFindOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
