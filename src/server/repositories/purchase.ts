import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { purchases, TPurchaseInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = (id: string, userId: string) => {
  return db.query.purchases.findFirst({
    where: and(eq(purchases.id, id), eq(purchases.userId, userId)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const purchase = await find(id, userId);

  if (!purchase) {
    throw new NotfoundError("Purchase");
  }

  return purchase;
};

const create = (input: TPurchaseInsert) => {
  return db.insert(purchases).values(input);
};

const remove = (id: string, userId: string) => {
  return db
    .update(purchases)
    .set({
      deletedAt: sql`NOW()`,
    })
    .where(and(eq(purchases.id, id), eq(purchases.userId, userId)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(purchases)
    .where(and(eq(purchases.id, id), eq(purchases.userId, userId)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(purchases)
    .set({
      deletedAt: null,
    })
    .where(and(eq(purchases.id, id), eq(purchases.userId, userId)));
};

export const purchaseRepository = {
  find,
  findOrThrow,
  create,
  remove,
  permRemove,
  restore,
};
