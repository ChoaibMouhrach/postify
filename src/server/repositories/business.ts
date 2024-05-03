import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { NotfoundError } from "../lib/action";
import { TBusinessInsert, businesses } from "../db/schema";
import { redirect } from "next/navigation";

const find = (id: string, userId: string) => {
  return db.query.businesses.findFirst({
    where: and(eq(businesses.userId, userId), eq(businesses.id, id)),
  });
};

const findOrThrow = async (id: string, userId: string) => {
  const business = await find(id, userId);

  if (!business) {
    throw new NotfoundError("Business");
  }

  return business;
};

const rscFindOrThrow = async (id: string, userId: string) => {
  const business = await find(id, userId);

  if (!business) {
    redirect("/businesses");
  }

  return business;
};

const create = async (input: TBusinessInsert) => {
  const business = await db.insert(businesses).values(input).returning({
    id: businesses.id,
  });

  return business[0];
};

const update = (
  id: string,
  userId: string,
  input: Partial<TBusinessInsert>,
) => {
  return db
    .update(businesses)
    .set(input)
    .where(and(eq(businesses.userId, userId), eq(businesses.id, id)));
};

const remove = (id: string, userId: string) => {
  return db
    .update(businesses)
    .set({
      deletedAt: `NOW()`,
    })
    .where(and(eq(businesses.userId, userId), eq(businesses.id, id)));
};

const restore = (id: string, userId: string) => {
  return db
    .update(businesses)
    .set({
      deletedAt: null,
    })
    .where(and(eq(businesses.userId, userId), eq(businesses.id, id)));
};

const permRemove = (id: string, userId: string) => {
  return db
    .delete(businesses)
    .where(and(eq(businesses.userId, userId), eq(businesses.id, id)));
};

export const businessRepository = {
  find,
  findOrThrow,
  rscFindOrThrow,
  create,
  update,
  remove,
  restore,
  permRemove,
};
