import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import { customers, orders, purchases, suppliers } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";
import { inArray, sql } from "drizzle-orm";
import { Charts } from "./charts";

interface OrdersProps {
  businesses: string[];
}

const Orders: React.FC<OrdersProps> = async ({ businesses }) => {
  let count: number = 0;

  if (businesses.length) {
    const response = await db
      .select({
        count: sql<string>`COUNT(*)`,
      })
      .from(orders)
      .where(inArray(orders.businessId, businesses));

    count = parseInt(response.at(0)!.count);
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
        count: sql<string>`COUNT(*)`,
      })
      .from(purchases)
      .where(inArray(purchases.businessId, businesses));

    count = parseInt(data.at(0)!.count);
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
        count: sql<string>`COUNT(*)`,
      })
      .from(customers)
      .where(inArray(customers.businessId, businesses));

    count = parseInt(data.at(0)!.count);
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
        count: sql<string>`COUNT(*)`,
      })
      .from(suppliers)
      .where(inArray(suppliers.businessId, businesses));

    count = parseInt(data.at(0)!.count);
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
  const user = await rscAuth();

  const data = await businessRepository.all(user.id);
  const ids = data.map((business) => business.id);

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
