import { db } from "@/server/db";
import {
  customersTable,
  ordersTable,
  purchasesTable,
  suppliersTable,
} from "@/server/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { Chart } from "./charts-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import React from "react";

interface OrdersProps {
  businessId: string;
}

const Orders: React.FC<OrdersProps> = async ({ businessId }) => {
  const data = await db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
      month: sql` strftime('%m', ${ordersTable.createdAt}) AS month`.mapWith(
        Number,
      ),
    })
    .from(ordersTable)
    .where(eq(ordersTable.businessId, businessId))
    .groupBy(sql`month`)
    .orderBy(asc(sql`month`))
    .then((recs) => {
      let data = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => rec.month === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: 0,
          month: i,
        });
      }

      return data;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>The total number of orders per month</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart data={data} />
      </CardContent>
    </Card>
  );
};

interface PurchasesProps {
  businessId: string;
}

const Purchases: React.FC<PurchasesProps> = async ({ businessId }) => {
  const data = await db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
      month: sql` strftime('%m', ${purchasesTable.createdAt}) AS month`.mapWith(
        Number,
      ),
    })
    .from(purchasesTable)
    .where(eq(purchasesTable.businessId, businessId))
    .groupBy(sql`month`.mapWith(Number))
    .orderBy(asc(sql`month`.mapWith(Number)))
    .then((recs) => {
      let data: { count: number; month: number }[] = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => rec.month === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: 0,
          month: i,
        });
      }

      return data;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchases</CardTitle>
        <CardDescription>
          The total number of purchases per month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chart data={data} />
      </CardContent>
    </Card>
  );
};

interface CustomersProps {
  businessId: string;
}

const Customers: React.FC<CustomersProps> = async ({ businessId }) => {
  const data = await db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
      month: sql` strftime('%m', ${customersTable.createdAt}) AS month`.mapWith(
        Number,
      ),
    })
    .from(customersTable)
    .where(eq(customersTable.businessId, businessId))
    .groupBy(sql`month`.mapWith(Number))
    .orderBy(asc(sql`month`.mapWith(Number)))
    .then((recs) => {
      let data: { count: number; month: number }[] = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => rec.month === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: 0,
          month: i,
        });
      }

      return data;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          The total number of customers per month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chart data={data} />
      </CardContent>
    </Card>
  );
};

interface SuppliersProps {
  businessId: string;
}

const Suppliers: React.FC<SuppliersProps> = async ({ businessId }) => {
  const data = await db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
      month: sql` strftime('%m', ${suppliersTable.createdAt}) AS month`.mapWith(
        Number,
      ),
    })
    .from(suppliersTable)
    .where(eq(suppliersTable.businessId, businessId))
    .groupBy(sql`month`.mapWith(Number))
    .orderBy(asc(sql`month`.mapWith(Number)))
    .then((recs) => {
      let data: { count: number; month: number }[] = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => rec.month === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: 0,
          month: i,
        });
      }

      return data;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
        <CardDescription>
          The total number of suppliers per month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chart data={data} />
      </CardContent>
    </Card>
  );
};

interface ChartsProps {
  businessId: string;
}

export const Charts: React.FC<ChartsProps> = async ({ businessId }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Orders businessId={businessId} />
      <Purchases businessId={businessId} />
      <Customers businessId={businessId} />
      <Suppliers businessId={businessId} />
    </div>
  );
};
