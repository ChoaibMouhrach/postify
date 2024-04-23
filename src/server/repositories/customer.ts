import { and, eq, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import { customers, TCustomerInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";

const find = async (id: string, userId: string) => {
  return db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.userId, userId)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const customer = await find(id, userId);

  if (!customer) {
    throw new NotfoundError("Customer");
  }

  return customer;
};

const count = async (where?: SQL<unknown>) => {
  const records = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(customers)
    .where(where);

  return parseInt(records[0].count);
};

const create = async (input: TCustomerInsert) => {
  const products = await db.insert(customers).values(input).returning({
    id: customers.id,
  });

  return products[0];
};

const update = (
  id: string,
  userId: string,
  input: Partial<TCustomerInsert>,
) => {
  return db
    .update(customers)
    .set(input)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
};

const remove = (id: string, userId: string) => {
  return db
    .update(customers)
    .set({
      deletedAt: sql<string>`NOW()`,
    })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(customers)
    .set({
      deletedAt: null,
    })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
};

export const customerRepository = {
  find,
  count,
  findOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
