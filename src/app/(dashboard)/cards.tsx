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
import { eq, sql } from "drizzle-orm";
import React from "react";

interface ProductCardProps {
  userId: string;
}

export const ProductCard: React.FC<ProductCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(products)
    .where(eq(products.userId, userId))
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

interface SupplierCardProps {
  userId: string;
}

export const SupplierCard: React.FC<SupplierCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(suppliers)
    .where(eq(suppliers.userId, userId))
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

interface CustomerCardProps {
  userId: string;
}

export const CustomerCard: React.FC<CustomerCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(customers)
    .where(eq(customers.userId, userId))
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

interface OrderCardProps {
  userId: string;
}

export const OrderCard: React.FC<OrderCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
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

interface PurchaseCardProps {
  userId: string;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(purchases)
    .where(eq(purchases.userId, userId))
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

interface TaskCardProps {
  userId: string;
}

export const TaskCard: React.FC<TaskCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(tasks)
    .where(eq(tasks.userId, userId))
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

interface CategoryCardProps {
  userId: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = async ({ userId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
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
