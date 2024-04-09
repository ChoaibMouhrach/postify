import { DataTable } from "@/client/components/data-table";
import { RECORDS_LIMIT } from "@/common/constants";
import { db } from "@/server/db";
import { customers } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import { and, desc, eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { pageSchema } from "@/common/schemas";

interface CustomersProps {
  searchParams: SearchParams;
}

const schema = z.object({
  page: pageSchema,
});

export const Customers: React.FC<CustomersProps> = async ({ searchParams }) => {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { page } = schema.parse(searchParams);

  const where = and(eq(customers.userId, session.user.id));

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
    <DataTable data={data} columns={columns} lastPage={lastPage} page={page}>
      <Button asChild>
        <Link href="/customers/create">New customer</Link>
      </Button>
    </DataTable>
  );
};
