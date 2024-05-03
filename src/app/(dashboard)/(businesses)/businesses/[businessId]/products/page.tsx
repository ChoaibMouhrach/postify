import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import React, { Suspense } from "react";
import { ProductsTable } from "./table";
import { SearchParams } from "@/types/nav";
import { DataTableSkeleton } from "@/client/components/data-table";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";

interface PageProps {
  searchParams: SearchParams;
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ searchParams, params }) => {
  const user = await rscAuth();

  await businessRepository.rscFindOrThrow(params.businessId, user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          You can manage your products from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<DataTableSkeleton />}>
          <ProductsTable
            businessId={params.businessId}
            searchParams={searchParams}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
