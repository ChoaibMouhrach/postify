import { DataTable } from "@/client/components/data-table";
import { Button } from "@/client/components/ui/button";
import { RECORDS_LIMIT } from "@/common/constants";
import {
  fromSchema,
  pageSchema,
  querySchema,
  toSchema,
  trashSchema,
} from "@/common/schemas";
import { db } from "@/server/db";
import { TBusiness, businesses } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { SearchParams } from "@/types/nav";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import Link from "next/link";
import React from "react";
import { z } from "zod";
import { columns } from "./columns";

interface BusinessesProps {
  searchParams: SearchParams;
}

const indexSchema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const Businesses: React.FC<BusinessesProps> = async ({
  searchParams,
}) => {
  const { page, query, trash, from, to } = indexSchema.parse(searchParams);

  const user = await rscAuth();

  const where = and(
    eq(businesses.userId, user.id),
    trash ? isNotNull(businesses.deletedAt) : isNull(businesses.deletedAt),
    from || to
      ? and(
          from
            ? gte(businesses.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            businesses.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query
      ? or(
          ilike(businesses.name, `%${query}%`),
          ilike(businesses.email, `%${query}%`),
          ilike(businesses.phone, `%${query}%`),
          ilike(businesses.address, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.businesses.findMany({
    where,
    orderBy: desc(businesses.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(businesses)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return (
    <DataTable<TBusiness>
      data={data}
      columns={columns}
      // meta
      query={query}
      trash={trash}
      from={from}
      to={to}
      // pagination
      lastPage={lastPage}
      page={page}
    >
      <Button asChild>
        <Link href="/businesses/create">New business</Link>
      </Button>
    </DataTable>
  );
};
