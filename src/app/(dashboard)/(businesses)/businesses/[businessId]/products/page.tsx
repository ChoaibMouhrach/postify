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

interface PageProps {
  searchParams: SearchParams;
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ searchParams, params }) => {
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
