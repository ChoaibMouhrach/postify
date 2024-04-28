import { DataTable } from "@/client/components/data-table";
import { Button } from "@/client/components/ui/button";
import { getOrdersAction } from "@/server/controllers/order";
import { SearchParams } from "@/types/nav";
import Link from "next/link";
import React from "react";
import { columns } from "./columns";
import { TCustomer, TOrder } from "@/server/db/schema";

interface OrdersProps {
  searchParams: SearchParams;
}

export const Orders: React.FC<OrdersProps> = async ({ searchParams }) => {
  const { data, lastPage, page, query, trash, from, to } =
    await getOrdersAction(searchParams);

  return (
    <DataTable<TOrder & { customer: TCustomer | null }>
      // data
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
        <Link href="/orders/create">New order</Link>
      </Button>
    </DataTable>
  );
};
