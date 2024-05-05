"use client";

import React from "react";
import Link from "next/link";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import { DataTable } from "@/client/components/data-table";
import { TBusiness, TCategory, TProduct } from "@/server/db/schema";

interface ProductsProps {
  // data
  data: (TProduct & { category: TCategory | null })[];
  business: TBusiness;

  // meta
  query: string;
  trash: boolean;
  from?: string;
  to?: string;

  // pagination
  page: number;
  lastPage: number;
}

export const Products: React.FC<ProductsProps> = ({
  // data
  data,
  business,
  // meta
  query,
  trash,
  to,
  from,
  // pagination
  page,
  lastPage,
}) => {
  return (
    <DataTable
      // data
      columns={columns(business.currency)}
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
        <Link href={`/businesses/${business.id}/products/create`}>Add new</Link>
      </Button>
    </DataTable>
  );
};
