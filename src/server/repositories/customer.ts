import { and, eq, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import { customers, TCustomerInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { redirect } from "next/navigation";

const find = async (id: string, businessId: string) => {
  return db.query.customers.findFirst({
    where: and(eq(customers.id, id), eq(customers.businessId, businessId)),
  });
};

const findOrThrow = async (id: string, businessId: string) => {
  const customer = await find(id, businessId);

  if (!customer) {
    throw new NotfoundError("Customer");
  }

  return customer;
};

const rscFindOrThrow = async (id: string, businessId: string) => {
  const customer = await find(id, businessId);

  if (!customer) {
    redirect(`/businesses/${businessId}/customers`);
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
  businessId: string,
  input: Partial<TCustomerInsert>,
) => {
  return db
    .update(customers)
    .set(input)
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));
};

const remove = (id: string, businessId: string) => {
  return db
    .update(customers)
    .set({
      deletedAt: sql<string>`NOW()`,
    })
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));
};

const permRemove = (id: string, businessId: string) => {
  return db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));
};

const restore = (id: string, businessId: string) => {
  return db
    .update(customers)
    .set({
      deletedAt: null,
    })
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));
};

export const customerRepository = {
  find,
  count,
  findOrThrow,
  rscFindOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
