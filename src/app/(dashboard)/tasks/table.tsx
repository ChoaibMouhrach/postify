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
import { tasks, TTask, TTaskStatus, TTaskType } from "@/server/db/schema";
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

interface TasksProps {
  searchParams: SearchParams;
}

const indexSchema = z.object({
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
  from: fromSchema,
  to: toSchema,
});

export const Tasks: React.FC<TasksProps> = async ({ searchParams }) => {
  const { page, query, trash, to, from } =
    await indexSchema.parse(searchParams);

  const user = await rscAuth();

  const where = and(
    eq(tasks.userId, user.id),
    trash ? isNotNull(tasks.deletedAt) : isNull(tasks.deletedAt),
    from || to
      ? and(
          from
            ? gte(tasks.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            tasks.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query
      ? or(
          ilike(tasks.title, `%${query}%`),
          ilike(tasks.description, `%${query}%`),
        )
      : undefined,
  );

  const dataPromise = db.query.tasks.findMany({
    where,
    with: {
      type: true,
      status: true,
    },
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
    orderBy: desc(tasks.createdAt),
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(tasks)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return (
    <DataTable<TTask & { type: TTaskType; status: TTaskStatus }>
      // data
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
        <Link href="/tasks/create">Add task</Link>
      </Button>
    </DataTable>
  );
};
