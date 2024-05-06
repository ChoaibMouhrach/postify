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
import { getOrdersAction } from "@/server/controllers/order";

interface OrdersWrapperProps {
  searchParams: SearchParams;
  businessId: string;
}

const OrdersWrapper: React.FC<OrdersWrapperProps> = async ({
  searchParams,
  businessId,
}) => {
  const { data, lastPage, page, query, trash, from, to, business } =
    await getOrdersAction({
      ...searchParams,
      businessId,
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
            <OrdersWrapper
              businessId={params.businessId}
              searchParams={searchParams}
            />
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
            <Order businessId={params.businessId} id={searchParams.id} />
          </Suspense>
        </Card>
      )}
    </div>
  );
};

export default Page;
