import { and, eq, isNull, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import { products, TProductInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = (id: string, userId: string) => {
  return db.query.products.findFirst({
    where: and(
      eq(products.id, id),
      eq(products.userId, userId),
      isNull(products.deletedAt),
    ),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const product = await find(id, userId);

  if (!product) {
    throw new NotfoundError("Product");
  }

  return product;
};

const count = async (where?: SQL<unknown>) => {
  const recs = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(products)
    .where(where);

  return parseInt(recs[0].count);
};

const create = async (input: TProductInsert) => {
  const ps = await db.insert(products).values(input).returning({
    id: products.id,
  });

  return ps[0];
};

const update = (id: string, userId: string, input: TProductInsert) => {
  return db
    .update(products)
    .set(input)
    .where(and(eq(products.id, id), eq(products.userId, userId)));
};

const remove = (id: string, userId: string) => {
  return db
    .update(products)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(products.id, id), eq(products.userId, userId)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.userId, userId)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(products)
    .set({
      deletedAt: null,
    })
    .where(and(eq(products.id, id), eq(products.userId, userId)));
};

export const productRepository = {
  find,
  findOrThrow,
  count,
  create,
  update,
  remove,
  restore,
  permRemove,
};
