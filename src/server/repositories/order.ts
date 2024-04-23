import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { orders, TOrderInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = (id: string, userId: string) => {
  return db.query.orders.findFirst({
    where: and(eq(orders.userId, userId), eq(orders.id, id)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const order = await find(id, userId);

  if (!order) {
    throw new NotfoundError("order");
  }

  return order;
};

const create = async (input: TOrderInsert) => {
  const os = await db.insert(orders).values(input).returning({
    id: orders.id,
  });

  return os[0];
};

const update = (id: string, userId: string, input: Partial<TOrderInsert>) => {
  return db
    .update(orders)
    .set(input)
    .where(and(eq(orders.userId, userId), eq(orders.id, id)));
};

const remove = (id: string, userId: string) => {
  return db
    .update(orders)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(orders.userId, userId), eq(orders.id, id)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(orders)
    .set({
      deletedAt: null,
    })
    .where(and(eq(orders.userId, userId), eq(orders.id, id)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(orders)
    .where(and(eq(orders.userId, userId), eq(orders.id, id)));
};

export const orderRepository = {
  find,
  findOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
