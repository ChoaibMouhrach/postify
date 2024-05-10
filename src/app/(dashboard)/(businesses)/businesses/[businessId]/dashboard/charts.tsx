import { db } from "@/server/db";
import { customers, orders, purchases, suppliers } from "@/server/db/schema";
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
      count: sql<string>`COUNT(*)`,
      month: sql<string>` strftime('%m', ${orders.createdAt}) AS month`,
    })
    .from(orders)
    .where(eq(orders.businessId, businessId))
    .groupBy(sql<string>`month`)
    .orderBy(asc(sql<string>`month`))
    .then((recs) => {
      let data = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => parseInt(rec.month) === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: "0",
          month: String(i),
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
      count: sql<string>`COUNT(*)`,
      month: sql<string>` strftime('%m', ${purchases.createdAt}) AS month`,
    })
    .from(purchases)
    .where(eq(purchases.businessId, businessId))
    .groupBy(sql<string>`month`)
    .orderBy(asc(sql<string>`month`))
    .then((recs) => {
      let data: { count: string; month: string }[] = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => parseInt(rec.month) === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: "0",
          month: String(i),
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
      count: sql<string>`COUNT(*)`,
      month: sql<string>` strftime('%m', ${customers.createdAt}) AS month`,
    })
    .from(customers)
    .where(eq(customers.businessId, businessId))
    .groupBy(sql<string>`month`)
    .orderBy(asc(sql<string>`month`))
    .then((recs) => {
      let data: { count: string; month: string }[] = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => parseInt(rec.month) === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: "0",
          month: String(i),
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
      count: sql<string>`COUNT(*)`,
      month: sql<string>` strftime('%m', ${suppliers.createdAt}) AS month`,
    })
    .from(suppliers)
    .where(eq(suppliers.businessId, businessId))
    .groupBy(sql<string>`month`)
    .orderBy(asc(sql<string>`month`))
    .then((recs) => {
      let data: { count: string; month: string }[] = [];

      for (let i = 1; i <= 12; i++) {
        const item = recs.find((rec) => parseInt(rec.month) === i);

        if (item) {
          data.push(item);
        }

        data.push({
          count: "0",
          month: String(i),
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
