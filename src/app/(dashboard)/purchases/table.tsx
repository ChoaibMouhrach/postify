import { DataTable } from "@/client/components/data-table";
import { RECORDS_LIMIT } from "@/common/constants";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { db } from "@/server/db";
import { TPurchase, TSupplier, purchases } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { SearchParams } from "@/types/nav";
import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
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
});

export const Purchases: React.FC<purchasesProps> = async ({ searchParams }) => {
  const user = await rscAuth();

  const { page, query, trash } = schema.parse(searchParams);

  const where = and(
    eq(purchases.userId, user.id),
    trash ? isNotNull(purchases.deletedAt) : isNull(purchases.deletedAt),
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
