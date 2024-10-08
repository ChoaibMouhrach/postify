import { DataTable } from "@/client/components/data-table";
import { TCategory } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import React from "react";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { getCategoriesAction } from "@/server/controllers/category";
import { redirect } from "next/navigation";

interface CategoriesProps {
  searchParams: SearchParams;
  businessId: string;
}

export const Categories: React.FC<CategoriesProps> = async ({
  searchParams,
  businessId,
}) => {
  const response = await getCategoriesAction({
    ...searchParams,
    businessId,
  });

  if (response?.serverError) {
    redirect(`/500?message=${response.serverError}`);
  }

  if (!response?.data) {
    redirect(`/500?message=Something went wrong`);
  }

  return (
    <DataTable<TCategory>
      data={response.data.data}
      columns={columns}
      // meta
      trash={response.data.trash}
      query={response.data.query}
      from={response.data.from}
      to={response.data.to}
      // pagination
      page={response.data.page}
      lastPage={response.data.lastPage}
    >
      <Button asChild>
        <Link href={`/businesses/${businessId}/categories/create`}>
          New category
        </Link>
      </Button>
    </DataTable>
  );
};
