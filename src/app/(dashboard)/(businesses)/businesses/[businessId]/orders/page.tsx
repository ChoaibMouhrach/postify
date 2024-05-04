import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Orders } from "./table";
import React, { Suspense } from "react";
import { DataTableSkeleton } from "@/client/components/data-table";
import { SearchParams } from "@/types/nav";
import { Order, OrderSkeleton } from "./order";
import { cn } from "@/client/lib/utils";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";
import { TBusiness } from "@/server/db/schema";
import { getOrdersAction } from "@/server/controllers/order";

interface OrdersWrapperProps {
  searchParams: SearchParams;
  business: TBusiness;
}

export const OrdersWrapper: React.FC<OrdersWrapperProps> = async ({
  searchParams,
  business,
}) => {
  const { data, lastPage, page, query, trash, from, to } =
    await getOrdersAction({
      ...searchParams,
      businessId: business.id,
    });

  return (
    <Orders
      data={data}
      business={business}
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
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        searchParams.id ? "lg:grid lg:grid-cols-5" : "",
      )}
    >
      <Card
        className={cn(
          "h-fit",
          searchParams.id ? "lg:col-start-1 lg:col-end-4" : "",
        )}
      >
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            You can manage your orders from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<DataTableSkeleton />}>
            <OrdersWrapper business={business} searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
      {searchParams.id && !(searchParams.id instanceof Array) && (
        <Card
          className={cn(
            "h-fit",
            searchParams.id ? "lg:col-start-4 lg:col-end-6" : "",
          )}
        >
          <Suspense fallback={<OrderSkeleton />}>
            <Order id={searchParams.id} business={business} />
          </Suspense>
        </Card>
      )}
    </div>
  );
};

export default Page;
