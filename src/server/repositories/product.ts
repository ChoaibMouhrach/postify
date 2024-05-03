import { and, eq, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import { products, TProductInsert } from "../db/schema";
import { NotfoundError } from "../lib/action";
import { redirect } from "next/navigation";

const find = (id: string, businessId: string) => {
  return db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.businessId, businessId)),
  });
};

const findOrThrow = async (id: string, businessId: string) => {
  const product = await find(id, businessId);

  if (!product) {
    throw new NotfoundError("Product");
  }

  return product;
};

const rscFindOrThrow = async (id: string, businessId: string) => {
  const product = await find(id, businessId);

  if (!product) {
    redirect(`/businesses/${businessId}/products`);
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

const update = (
  id: string,
  businessId: string,
  input: Partial<TProductInsert>,
) => {
  return db
    .update(products)
    .set(input)
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
};

const remove = (id: string, businessId: string) => {
  return db
    .update(products)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
};

const permRemove = (id: string, businessId: string) => {
  return db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
};

const restore = (id: string, businessId: string) => {
  return db
    .update(products)
    .set({
      deletedAt: null,
    })
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
};

export const productRepository = {
  find,
  findOrThrow,
  rscFindOrThrow,
  count,
  create,
  update,
  remove,
  restore,
  permRemove,
};
