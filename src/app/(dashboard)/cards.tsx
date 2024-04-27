import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import { db } from "@/server/db";
import {
  categories,
  customers,
  orders,
  products,
  purchases,
  suppliers,
  tasks,
} from "@/server/db/schema";
import { sql } from "drizzle-orm";

export const ProductCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(products)
    .then((products) => {
      return parseInt(products[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Products</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const SupplierCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(suppliers)
    .then((suppliers) => {
      return parseInt(suppliers[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Suppliers</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const CustomerCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(customers)
    .then((customers) => {
      return parseInt(customers[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Customers</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const OrderCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(orders)
    .then((orders) => {
      return parseInt(orders[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Orders</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const PurchaseCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(purchases)
    .then((purchases) => {
      return parseInt(purchases[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Purchases</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const TaskCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(tasks)
    .then((tasks) => {
      return parseInt(tasks[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Tasks</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const CategoryCard = async () => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(categories)
    .then((categories) => {
      return parseInt(categories[0].count);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{count}</CardTitle>
        <CardDescription>Categories</CardDescription>
      </CardHeader>
    </Card>
  );
};

export const CardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="w-6 h-2" />
        <Skeleton className="w-20 h-2" />
      </CardHeader>
    </Card>
  );
};
