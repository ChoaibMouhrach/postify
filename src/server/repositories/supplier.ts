import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { TSupplierInsert, suppliers } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { PgUpdateSetSource } from "drizzle-orm/pg-core";

const find = (id: string, businessId: string) => {
  return db.query.suppliers.findFirst({
    where: and(eq(suppliers.id, id), eq(suppliers.businessId, businessId)),
  });
};

const findOrThrow = async (id: string, businessId: string) => {
  const supplier = await find(id, businessId);

  if (!supplier) {
    throw new NotfoundError("Supplier");
  }

  return supplier;
};

const create = async (input: TSupplierInsert) => {
  const products = await db
    .insert(suppliers)
    .values(input)
    .returning({ id: suppliers.id });

  return products[0];
};

const update = (
  id: string,
  businessId: string,
  input: PgUpdateSetSource<typeof suppliers>,
) => {
  return db
    .update(suppliers)
    .set(input)
    .where(and(eq(suppliers.id, id), eq(suppliers.businessId, businessId)));
};

const remove = (id: string, businessId: string) => {
  return db
    .update(suppliers)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(suppliers.id, id), eq(suppliers.businessId, businessId)));
};

const permRemove = (id: string, businessId: string) => {
  return db
    .delete(suppliers)
    .where(and(eq(suppliers.id, id), eq(suppliers.businessId, businessId)));
};

const restore = (id: string, businessId: string) => {
  return db
    .update(suppliers)
    .set({
      deletedAt: null,
    })
    .where(and(eq(suppliers.id, id), eq(suppliers.businessId, businessId)));
};

export const supplierRepository = {
  find,
  findOrThrow,
  create,
  update,
  remove,
  permRemove,
  restore,
};
