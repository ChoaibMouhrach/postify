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

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          You can manage your products from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback="loading...">
          <ProductsTable searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
