import { DataTable } from "@/client/components/data-table";
import { Button } from "@/client/components/ui/button";
import { TBusiness } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import Link from "next/link";
import React from "react";
import { columns } from "./columns";
import { getBusinessesAction } from "@/server/controllers/business";

interface BusinessesProps {
  searchParams: SearchParams;
}

export const Businesses: React.FC<BusinessesProps> = async ({
  searchParams,
}) => {
  const { data, query, trash, from, to, page, lastPage } =
    await getBusinessesAction(searchParams);

  return (
    <DataTable<TBusiness>
      data={data}
      columns={columns}
      // meta
      query={query}
      trash={trash}
      from={from}
      to={to}
      // pagination
      lastPage={lastPage}
      page={page}
    >
      <Button asChild>
        <Link href="/businesses/create">New business</Link>
      </Button>
    </DataTable>
  );
};
