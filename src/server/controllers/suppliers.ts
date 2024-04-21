"use server";

import { RECORDS_LIMIT } from "@/common/constants";
import { and, eq, isNotNull, isNull, or, ilike, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { suppliers } from "../db/schema";
import { rscAuth } from "../lib/action";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { z } from "zod";
import { SearchParams } from "@/types/nav";

const schema = z.object({
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
});

export const getSuppliersAction = async (searchParams: SearchParams) => {
  const user = await rscAuth();

  const { page, query, trash } = schema.parse(searchParams);

  const where = and(
    eq(suppliers.userId, user.id),
    trash ? isNotNull(suppliers.deletedAt) : isNull(suppliers.deletedAt),
    query
      ? or(
          ilike(suppliers.name, `%${query}%`),
          ilike(suppliers.email, `%${query}%`),
          ilike(suppliers.phone, `%${query}%`),
          ilike(suppliers.address, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.suppliers.findMany({
    where,
    orderBy: desc(suppliers.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(suppliers)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return {
    data,
    page,
    lastPage,
    trash,
    query,
  };
};
