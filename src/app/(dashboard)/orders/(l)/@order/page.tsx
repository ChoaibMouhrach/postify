import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { auth } from "@/server/lib/action";
import { SearchParams } from "@/types/nav";
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

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  if (!searchParams.id || searchParams.id instanceof Array) {
    return;
  }

  const user = await auth();

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.userId, user.id), eq(orders.id, searchParams.id)),
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
    <Card>
      <CardHeader>
        <CardTitle>Order # {order.id}</CardTitle>
        <CardDescription>
          {new Date(order.createdAt).toUTCString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <span className="font-semibold">Customer {order.customer?.name}</span>
        <section className="flex flex-col text-sm">
          <span>Phone</span>
          <span className="text-muted-foreground">{order.customer?.phone}</span>
          <span className="mt-3">Email address</span>
          <span className="text-muted-foreground">{order.customer?.email}</span>
          <span className="mt-3">Address</span>
          <span className="text-muted-foreground">
            {order.customer?.address}
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
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.price * item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </CardContent>
    </Card>
  );
};

export default Page;
