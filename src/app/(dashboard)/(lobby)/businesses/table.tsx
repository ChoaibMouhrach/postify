import { DataTable } from "@/client/components/data-table";
import { Button } from "@/client/components/ui/button";
import { TBusiness } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import Link from "next/link";
import React from "react";
import { columns } from "./columns";
import { getBusinessesAction } from "@/server/controllers/business";
import { redirect } from "next/navigation";

interface BusinessesProps {
  searchParams: SearchParams;
}

export const Businesses: React.FC<BusinessesProps> = async ({
  searchParams,
}) => {
  const response = await getBusinessesAction(searchParams);

  if (response?.serverError) {
    redirect(`/500?message=${response.serverError}`);
  }

  if (!response?.data) {
    redirect(`/500?message=Something went wrong`);
  }

  return (
    <DataTable<TBusiness>
      data={response.data.data}
      columns={columns}
      // meta
      query={response.data.query}
      trash={response.data.trash}
      from={response.data.from}
      to={response.data.to}
      // pagination
      lastPage={response.data.lastPage}
      page={response.data.page}
    >
      <Button asChild>
        <Link href="/businesses/create">New business</Link>
      </Button>
    </DataTable>
  );
};
