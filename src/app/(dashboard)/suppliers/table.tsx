import { DataTable } from "@/client/components/data-table";
import { RECORDS_LIMIT } from "@/common/constants";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { db } from "@/server/db";
import { TSupplier, suppliers } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { SearchParams } from "@/types/nav";
import { and, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";

interface SuppliersProps {
  searchParams: SearchParams;
}

const schema = z.object({
  page: pageSchema,
  query: querySchema,
  trash: trashSchema,
});

export const Suppliers: React.FC<SuppliersProps> = async ({ searchParams }) => {
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
    .then((recs) => parseInt(recs[0].count));

  const [data, count] = await Promise.all([dataPromise, countPromise]);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return (
    <DataTable<TSupplier>
      data={data}
      columns={columns}
      lastPage={lastPage}
      page={page}
      query={query}
      trash={trash}
    >
      <Button asChild>
        <Link href="/suppliers/create">New supplier</Link>
      </Button>
    </DataTable>
  );
};
