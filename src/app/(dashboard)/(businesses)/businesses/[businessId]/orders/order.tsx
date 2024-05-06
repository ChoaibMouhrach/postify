import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import React from "react";
import { Skeleton } from "@/client/components/ui/skeleton";
import { businessRepository } from "@/server/repositories/business";
import { rscAuth } from "@/server/lib/action";

interface OrderProps {
  id: string;
  businessId: string;
}

export const Order: React.FC<OrderProps> = async ({ businessId, id }) => {
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(businessId, user.id);

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.businessId, business.id), eq(orders.id, id)),
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

  return (
    <>
      <CardHeader>
        <CardTitle>Order # {order.id}</CardTitle>
        <CardDescription>
          {new Date(order.createdAt).toUTCString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <span className="font-semibold">{business.name}</span>
        <section className="flex flex-col text-sm">
          <span>Phone</span>
          <span className="text-muted-foreground">{business.phone}</span>
          <span className="mt-3">Email address</span>
          <span className="text-muted-foreground">
            {business.email || "N/A"}
          </span>
          <span className="mt-3">Address</span>
          <span className="text-muted-foreground">
            {business.address || "N/A"}
          </span>
        </section>
        <span className="font-semibold">Customer {order.customer?.name}</span>
        <section className="flex flex-col text-sm">
          <span>Phone</span>
          <span className="text-muted-foreground">{order.customer?.phone}</span>
          <span className="mt-3">Email address</span>
          <span className="text-muted-foreground">
            {order.customer?.email || "N/A"}
          </span>
          <span className="mt-3">Address</span>
          <span className="text-muted-foreground">
            {order.customer?.address || "N/A"}
          </span>
        </section>
        <span className="font-semibold mt-2">Items</span>
        <section className="flex flex-col text-sm gap-2 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.price} {business.currency}
                  </TableCell>
                  <TableCell>
                    {item.price * item.quantity} {business.currency}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </CardContent>
    </>
  );
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
