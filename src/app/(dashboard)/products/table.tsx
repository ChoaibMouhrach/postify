import { DataTable } from "@/client/components/data-table";
import React from "react";
import { db } from "@/server/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { products } from "@/server/db/schema";
import { authOptions } from "@/server/lib/auth";
import { SearchParams } from "@/types/nav";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { z } from "zod";
import { columns } from "./columns";
import { pageSchema, querySchema, trashSchema } from "@/common/schemas";
import { productRepository } from "@/server/repositories/product";

interface ProductsTableProps {
  searchParams: SearchParams;
}

const schema = z.object({
  page: pageSchema,
  trash: trashSchema,
  query: querySchema,
});

export const ProductsTable: React.FC<ProductsTableProps> = async ({
  searchParams,
}) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }
  const { page, trash, query } = schema.parse(searchParams);

  const where = and(
    eq(products.userId, session.user.id),
    trash ? isNotNull(products.deletedAt) : isNull(products.deletedAt),
    query
      ? or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
        )
      : undefined,
  );

  const data = await db.query.products.findMany({
    where,
    orderBy: desc(products.createdAt),
    limit: 8,
    offset: (page - 1) * 8,
  });

  const count = await productRepository.count(where);

  const lastPage = Math.ceil(count / 8);

  return (
    <DataTable
      // data
      columns={columns}
      data={data}
      // meta
      trash={trash}
      query={query}
      // pagination
      page={page}
      lastPage={lastPage}
    >
      <Button asChild>
        <Link href="/products/create">Add new</Link>
      </Button>
    </DataTable>
  );
};
