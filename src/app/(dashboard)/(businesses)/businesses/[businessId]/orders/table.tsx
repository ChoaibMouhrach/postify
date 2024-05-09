"use client";

import { DataTable } from "@/client/components/data-table";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import React from "react";
import { columns } from "./columns";
import { TBusiness, TCustomer, TOrder, TOrderType } from "@/server/db/schema";

interface OrdersProps {
  business: TBusiness;
  data: (TOrder & { customer: TCustomer | null; type: TOrderType })[];
  // meta
  query: string;
  trash: boolean;
  from?: string;
  to?: string;
  // pagination
  page: number;
  lastPage: number;
}

export const Orders: React.FC<OrdersProps> = async ({
  data,
  business,
  // meta
  query,
  trash,
  from,
  to,

  // pagination
  page,
  lastPage,
}) => {
  return (
    <DataTable<TOrder & { customer: TCustomer | null; type: TOrderType }>
      // data
      data={data}
      columns={columns(business.currency)}
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
        <Link href={`/businesses/${business.id}/orders/create`}>New order</Link>
      </Button>
    </DataTable>
  );
};
