import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import {
  businessesTable,
  customersTable,
  ordersTable,
  purchasesTable,
  suppliersTable,
} from "@/server/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { Charts } from "./charts";
import { validateRequest } from "@/server/lib/auth";
import { redirect } from "next/navigation";

interface OrdersProps {
  businesses: string[];
}

const Orders: React.FC<OrdersProps> = async ({ businesses }) => {
  let count: number = 0;

  if (businesses.length) {
    const response = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(ordersTable)
      .where(inArray(ordersTable.businessId, businesses));

    count = response.at(0)!.count;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Orders</CardDescription>
      </CardHeader>
    </Card>
  );
};

interface PurchasesProps {
  businesses: string[];
}

const Purchases: React.FC<PurchasesProps> = async ({ businesses }) => {
  let count = 0;

  if (businesses.length) {
    const data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(purchasesTable)
      .where(inArray(purchasesTable.businessId, businesses));

    count = data.at(0)!.count;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Purchases</CardDescription>
      </CardHeader>
    </Card>
  );
};

interface CustomersProps {
  businesses: string[];
}

const Customers: React.FC<CustomersProps> = async ({ businesses }) => {
  let count = 0;

  if (businesses.length) {
    const data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(customersTable)
      .where(inArray(customersTable.businessId, businesses));

    count = data.at(0)!.count;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Customers</CardDescription>
      </CardHeader>
    </Card>
  );
};

interface SuppliersProps {
  businesses: string[];
}

const Suppliers: React.FC<SuppliersProps> = async ({ businesses }) => {
  let count = 0;

  if (businesses.length) {
    const data = await db
      .select({
        count: sql`COUNT(*)`.mapWith(Number),
      })
      .from(suppliersTable)
      .where(inArray(suppliersTable.businessId, businesses));

    count = data.at(0)!.count;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Suppliers</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const Cards = async () => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const businesses = await db
    .select({
      id: businessesTable.id,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, user.id));

  let ids = businesses.map(({ id }) => id);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <Orders businesses={ids} />
        <Purchases businesses={ids} />
        <Customers businesses={ids} />
        <Suppliers businesses={ids} />
      </div>
      <Charts businesses={ids} />
    </>
  );
};
