import { db } from "@/server/db";
import {
  customersTable,
  ordersTable,
  purchasesTable,
  suppliersTable,
} from "@/server/db/schema";
import { asc, inArray, sql } from "drizzle-orm";
import { Chart } from "./charts-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import React from "react";

export const getEmptySet = () => {
  return [...Array(12)].map((_, index) => ({
    count: 0,
    month: index + 1,
  }));
};

interface OrdersProps {
  businesses: string[];
}

const Orders: React.FC<OrdersProps> = async ({ businesses }) => {
  let data = getEmptySet();

  if (businesses.length) {
    data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
        month:
          sql` EXTRACT(MONTH FROM ${ordersTable.createdAt}) AS month`.mapWith(
            Number,
          ),
      })
      .from(ordersTable)
      .where(inArray(ordersTable.businessId, businesses))
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
  }

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
  businesses: string[];
}

const Purchases: React.FC<PurchasesProps> = async ({ businesses }) => {
  let data = getEmptySet();

  if (businesses.length) {
    data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
        month:
          sql` EXTRACT(MONTH FROM ${purchasesTable.createdAt}) AS month`.mapWith(
            Number,
          ),
      })
      .from(purchasesTable)
      .where(inArray(purchasesTable.businessId, businesses))
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
  }

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
  businesses: string[];
}

const Customers: React.FC<CustomersProps> = async ({ businesses }) => {
  let data = getEmptySet();

  if (businesses.length) {
    data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
        month:
          sql` EXTRACT(MONTH FROM ${customersTable.createdAt}) AS month`.mapWith(
            Number,
          ),
      })
      .from(customersTable)
      .where(inArray(customersTable.businessId, businesses))
      .groupBy(sql`month`)
      .orderBy(asc(sql`month`))
      .then((recs) => {
        let data = [];

        for (let i = 1; i <= 12; i++) {
          const item = recs.find((rec) => rec.month === i);

          if (item) {
            data.push(item);
            continue;
          }

          data.push({
            count: 0,
            month: i,
          });
        }

        return data;
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          The total number of customers per month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chart data={data} />
      </CardContent>
    </Card>
  );
};

interface SuppliersProps {
  businesses: string[];
}

const Suppliers: React.FC<SuppliersProps> = async ({ businesses }) => {
  let data = getEmptySet();

  if (businesses.length) {
    data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
        month:
          sql` EXTRACT(MONTH FROM ${suppliersTable.createdAt}) AS month`.mapWith(
            Number,
          ),
      })
      .from(suppliersTable)
      .where(inArray(suppliersTable.businessId, businesses))
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
  }

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
  businesses: string[];
}

export const Charts: React.FC<ChartsProps> = async ({ businesses }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Orders businesses={businesses} />
      <Purchases businesses={businesses} />
      <Customers businesses={businesses} />
      <Suppliers businesses={businesses} />
    </div>
  );
};
