import { DataTable } from "@/client/components/data-table";
import { TCategory } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import React from "react";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { getCategoriesAction } from "@/server/controllers/category";

interface CategoriesProps {
  searchParams: SearchParams;
  businessId: string;
}

export const Categories: React.FC<CategoriesProps> = async ({
  searchParams,
  businessId,
}) => {
  const { data, trash, query, from, to, page, lastPage } =
    await getCategoriesAction({
      ...searchParams,
      businessId,
    });

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
        <Link href={`/businesses/${businessId}/categories/create`}>
          New category
        </Link>
      </Button>
    </DataTable>
  );
};
