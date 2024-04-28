import { DataTable } from "@/client/components/data-table";
import { RECORDS_LIMIT } from "@/common/constants";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { db } from "@/server/db";
import { categories, TCategory } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { SearchParams } from "@/types/nav";
import {
  and,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import React from "react";
import { z } from "zod";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";

interface CategoriesProps {
  searchParams: SearchParams;
}

const schema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const Categories: React.FC<CategoriesProps> = async ({
  searchParams,
}) => {
  const user = await rscAuth();

  const { page, query, trash, from, to } = schema.parse(searchParams);

  const where = and(
    eq(categories.userId, user.id),
    trash ? isNotNull(categories.deletedAt) : isNull(categories.deletedAt),
    from || to
      ? and(
          from
            ? gte(categories.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            categories.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query ? or(ilike(categories.name, `%${query}%`)) : undefined,
  );

  const dataPromise = db.query.categories.findMany({
    where,
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(categories)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return (
    <DataTable<TCategory>
      data={data}
      columns={columns}
      // meta
      trash={trash}
      query={query}
      from={from}
      to={to}
      // pagination
      page={page}
      lastPage={lastPage}
    >
      <Button asChild>
        <Link href="/categories/create">New category</Link>
      </Button>
    </DataTable>
  );
};
