import { DataTable } from "@/client/components/data-table";
import React from "react";
import { SearchParams } from "@/types/nav";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { getProductsAction } from "@/server/controllers/product";

interface ProductsTableProps {
  searchParams: SearchParams;
  businessId: string;
}

export const ProductsTable: React.FC<ProductsTableProps> = async ({
  searchParams,
  businessId,
}) => {
  const { data, lastPage, page, trash, query, from, to } =
    await getProductsAction({
      ...searchParams,
      businessId,
    });

  return (
    <DataTable
      // data
      columns={columns}
      data={data}
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
        <Link href={`/businesses/${businessId}/products/create`}>Add new</Link>
      </Button>
    </DataTable>
  );
};
