import { CardContent, CardHeader } from "@/client/components/ui/card";
import { db } from "@/server/db";
import { ordersTable } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { Skeleton } from "@/client/components/ui/skeleton";
import { PrintOrder } from "./print-order";
import { BusinessesRepo } from "@/server/repositories/business";
import { validateRequest } from "@/server/lib/auth";

interface OrderProps {
  id: string;
  businessId: string;
}

export const Order: React.FC<OrderProps> = async ({ businessId, id }) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const business = await BusinessesRepo.find({
    id: businessId,
    userId: user.id,
  });

  if (!business) {
    notFound();
  }

  const order = await db.query.ordersTable.findFirst({
    where: and(
      eq(ordersTable.businessId, business.data.id),
      eq(ordersTable.id, id),
    ),
    with: {
      customer: true,
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/orders");
  }

  return <PrintOrder order={order} business={business.data} />;
};

export const OrderSkeleton = () => {
  return (
    <>
      <CardHeader className="flex flex-col gap-2">
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-3 w-32" />

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 mt-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 mt-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>

        <Skeleton className="mt-2 h-3 w-32" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </CardContent>
    </>
  );
};
