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
import { redirect } from "next/navigation";

interface ProductsWrapperProps {
  searchParams: SearchParams;
  businessId: string;
}

const ProductsWrapper: React.FC<ProductsWrapperProps> = async ({
  searchParams,
  businessId,
}) => {
  const response = await getProductsAction({
    ...searchParams,
    businessId: businessId,
  });

  if (response?.serverError) {
    redirect(`/500?message=${response.serverError}`);
  }

  if (!response?.data) {
    redirect(`/500?message=Something went wrong`);
  }

  return (
    <Products
      // data
      data={response.data.data}
      business={response.data.business.data}
      // meta
      query={response.data.query}
      trash={response.data.trash}
      from={response.data.from}
      to={response.data.to}
      // pagination
      page={response.data.page}
      lastPage={response.data.lastPage}
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
