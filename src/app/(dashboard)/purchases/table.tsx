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
import { TPurchase, TSupplier, purchases, suppliers } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { SearchParams } from "@/types/nav";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";

interface purchasesProps {
  searchParams: SearchParams;
}

const schema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
  from: fromSchema,
  to: toSchema,
});

export const Purchases: React.FC<purchasesProps> = async ({ searchParams }) => {
  const user = await rscAuth();

  const { page, query, trash, from, to } = schema.parse(searchParams);

  const suppliersReauest = db
    .select({
      id: suppliers.id,
    })
    .from(suppliers)
    .where(
      and(eq(suppliers.userId, user.id), ilike(suppliers.name, `%${query}%`)),
    );

  const where = and(
    eq(purchases.userId, user.id),
    trash ? isNotNull(purchases.deletedAt) : isNull(purchases.deletedAt),
    from || to
      ? and(
          from
            ? gte(purchases.createdAt, new Date(parseInt(from)).toDateString())
            : undefined,
          lte(
            purchases.createdAt,
            to ? new Date(parseInt(to)).toDateString() : `NOW()`,
          ),
        )
      : undefined,
    query ? inArray(purchases.supplierId, suppliersReauest) : undefined,
  );

  const dataPromise = db.query.purchases.findMany({
    where,
    orderBy: desc(purchases.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
    with: {
      supplier: true,
    },
  });

  const countPromise = db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(purchases)
    .where(where)
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return (
    <DataTable<TPurchase & { supplier: TSupplier }>
      data={data}
      columns={columns}
      trash={trash}
      page={page}
      lastPage={lastPage}
      query={query}
    >
      <Button asChild>
        <Link href={"/purchases/create"}>New purchase</Link>
      </Button>
    </DataTable>
  );
};
