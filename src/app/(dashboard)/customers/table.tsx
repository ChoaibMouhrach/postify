import { DataTable } from "@/client/components/data-table";
import { RECORDS_LIMIT } from "@/common/constants";
import { db } from "@/server/db";
import { customers } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import { and, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { authOptions } from "@/server/lib/auth";

interface CustomersProps {
  searchParams: SearchParams;
}

const schema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
});

export const Customers: React.FC<CustomersProps> = async ({ searchParams }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { page, query, trash } = schema.parse(searchParams);

  const where = and(
    eq(customers.userId, session.user.id),
    trash ? isNotNull(customers.deletedAt) : isNull(customers.deletedAt),
    query
      ? or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.address, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(customers.phone, `%${query}%`),
        )
      : undefined,
  );

  const data = await db.query.customers.findMany({
    where,
    orderBy: desc(customers.createdAt),
    limit: RECORDS_LIMIT,
    offset: (page - 1) * RECORDS_LIMIT,
  });

  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(customers)
    .then((recs) => parseInt(recs[0].count));

  const lastPage = Math.ceil(count / 8);

  return (
    <DataTable
      data={data}
      columns={columns}
      // meta
      query={query}
      trash={trash}
      // pagination
      lastPage={lastPage}
      page={page}
    >
      <Button asChild>
        <Link href="/customers/create">New customer</Link>
      </Button>
    </DataTable>
  );
};
