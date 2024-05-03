import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { purchases, TPurchaseInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = (id: string, businessId: string) => {
  return db.query.purchases.findFirst({
    where: and(eq(purchases.id, id), eq(purchases.businessId, businessId)),
  });
};

const findOrThrow = async (id: string, businessId: string) => {
  const purchase = await find(id, businessId);

  if (!purchase) {
    throw new NotfoundError("Purchase");
  }

  return purchase;
};

const create = (input: TPurchaseInsert) => {
  return db.insert(purchases).values(input);
};

const remove = (id: string, businessId: string) => {
  return db
    .update(purchases)
    .set({
      deletedAt: sql`NOW()`,
    })
    .where(and(eq(purchases.id, id), eq(purchases.businessId, businessId)));
};

const permRemove = (id: string, businessId: string) => {
  return db
    .delete(purchases)
    .where(and(eq(purchases.id, id), eq(purchases.businessId, businessId)));
};

const restore = (id: string, businessId: string) => {
  return db
    .update(purchases)
    .set({
      deletedAt: null,
    })
    .where(and(eq(purchases.id, id), eq(purchases.businessId, businessId)));
};

const update = (
  id: string,
  businessId: string,
  input: Partial<TPurchaseInsert>,
) => {
  return db
    .update(purchases)
    .set(input)
    .where(and(eq(purchases.id, id), eq(purchases.businessId, businessId)));
};

export const purchaseRepository = {
  find,
  findOrThrow,
  update,
  create,
  remove,
  permRemove,
  restore,
};
