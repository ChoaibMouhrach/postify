"use client";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import React, { useRef } from "react";
import { Button } from "@/client/components/ui/button";
import {
  TBusiness,
  TCustomer,
  TOrder,
  TOrderItem,
  TProduct,
} from "@/server/db/schema";
import { useReactToPrint } from "react-to-print";

interface PrintOrderProps {
  order: TOrder & {
    customer: TCustomer | null;
    items: (TOrderItem & {
      product: TProduct;
    })[];
  };
  business: TBusiness;
}

export const PrintOrder: React.FC<PrintOrderProps> = ({ order, business }) => {
  const cmp = useRef(null);
  const print = useReactToPrint({
    content: () => cmp.current,
  });

  return (
    <>
      <section ref={cmp}>
        <CardHeader>
          <CardTitle>Order # {order.id}</CardTitle>
          <CardDescription>
            {new Date(order.createdAt).toUTCString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <section className="grid grid-cols-2">
            <section className="flex flex-col gap-4">
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
            </section>

            <section className="flex flex-col gap-4">
              <span className="font-semibold">
                Customer {order.customer?.name}
              </span>
              <section className="flex flex-col text-sm">
                <span>Phone</span>
                <span className="text-muted-foreground">
                  {order.customer?.phone}
                </span>
                <span className="mt-3">Email address</span>
                <span className="text-muted-foreground">
                  {order.customer?.email || "N/A"}
                </span>
                <span className="mt-3">Address</span>
                <span className="text-muted-foreground">
                  {order.customer?.address || "N/A"}
                </span>
              </section>
            </section>
          </section>
          <span className="font-semibold mt-2">Items</span>
          <section className="flex flex-col text-sm gap-2 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total before tax</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => {
                  const tbt = item.price * item.quantity;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.price} {business.currency}
                      </TableCell>
                      <TableCell>
                        {tbt} {business.currency}
                      </TableCell>
                      <TableCell>{item.tax} %</TableCell>
                      <TableCell>
                        {tbt + (tbt * item.tax) / 100} {business.currency}
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableRow className="bg-muted">
                  <TableCell colSpan={5} className="text-end">
                    Total
                  </TableCell>
                  <TableCell>
                    {order.items
                      .map((item) => {
                        const tbt = item.price * item.quantity;
                        return tbt + (tbt * item.tax) / 100;
                      })
                      .reduce((a, b) => a + b)}{" "}
                    {business.currency}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {order.note && (
            <>
              <span className="font-semibold mt-2">Note</span>

              <p>{order.note}</p>
            </>
          )}
        </CardContent>
      </section>
      <CardFooter>
        <Button onClick={print}>Print invoice</Button>
      </CardFooter>
    </>
  );
};
