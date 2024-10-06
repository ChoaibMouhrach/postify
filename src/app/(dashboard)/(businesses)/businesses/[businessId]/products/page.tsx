import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import React, { Suspense } from "react";
import { Products } from "./products";
import { SearchParams } from "@/types/nav";
import { DataTableSkeleton } from "@/client/components/data-table";
import { getProductsAction } from "@/server/controllers/product";

interface ProductsWrapperProps {
  searchParams: SearchParams;
  businessId: string;
}

const ProductsWrapper: React.FC<ProductsWrapperProps> = async ({
  searchParams,
  businessId,
}) => {
  const { data, lastPage, page, trash, query, from, to, business } =
    await getProductsAction({
      ...searchParams,
      businessId: businessId,
      category: true,
    });

  return (
    <Products
      // data
      data={data}
      business={business.data}
      // meta
      query={query}
      trash={trash}
      from={from}
      to={to}
      // pagination
      page={page}
      lastPage={lastPage}
    />
  );
};

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
          <ProductsWrapper
            businessId={params.businessId}
            searchParams={searchParams}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
