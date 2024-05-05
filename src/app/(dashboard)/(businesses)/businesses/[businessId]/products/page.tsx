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
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";
import { TBusiness } from "@/server/db/schema";
import { getProductsAction } from "@/server/controllers/product";

interface ProductsWrapperProps {
  searchParams: SearchParams;
  business: TBusiness;
}

const ProductsWrapper: React.FC<ProductsWrapperProps> = async ({
  searchParams,
  business,
}) => {
  const { data, lastPage, page, trash, query, from, to } =
    await getProductsAction({
      ...searchParams,
      businessId: business.id,
      category: true,
    });

  return (
    <Products
      data={data}
      business={business}
      query={query}
      trash={trash}
      from={from}
      to={to}
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
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(
    params.businessId,
    user.id,
  );

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
          <ProductsWrapper business={business} searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
