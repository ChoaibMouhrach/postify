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
import { redirect } from "next/navigation";

interface OrdersWrapperProps {
  searchParams: SearchParams;
  businessId: string;
}

const OrdersWrapper: React.FC<OrdersWrapperProps> = async ({
  searchParams,
  businessId,
}) => {
  const response = await getOrdersAction({
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
    <Orders
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
    <div
      className={cn(
        "flex flex-col gap-4",
        searchParams.id ? "lg:grid lg:grid-cols-2" : "",
      )}
    >
      <Card className="h-fit">
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
        <Card className="h-fit">
          <Suspense fallback={<OrderSkeleton />}>
            <Order businessId={params.businessId} id={searchParams.id} />
          </Suspense>
        </Card>
      )}
    </div>
  );
};

export default Page;
