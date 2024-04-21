import { DataTable } from "@/client/components/data-table";
import React from "react";
import { SearchParams } from "@/types/nav";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { getProductsAction } from "@/server/controllers/product";

interface ProductsTableProps {
  searchParams: SearchParams;
}

export const ProductsTable: React.FC<ProductsTableProps> = async ({
  searchParams,
}) => {
  const { data, lastPage, page, trash, query } =
    await getProductsAction(searchParams);

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
