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
} from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import React, { Suspense } from "react";

interface ProductCardProps {
  businessId: string;
}

const ProductCard: React.FC<ProductCardProps> = async ({ businessId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(products)
    .where(eq(products.businessId, businessId))
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
  businessId: string;
}

const SupplierCard: React.FC<SupplierCardProps> = async ({ businessId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(suppliers)
    .where(eq(suppliers.businessId, businessId))
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
  businessId: string;
}

const CustomerCard: React.FC<CustomerCardProps> = async ({ businessId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(customers)
    .where(eq(customers.businessId, businessId))
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
  businessId: string;
}

const OrderCard: React.FC<OrderCardProps> = async ({ businessId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(orders)
    .where(eq(orders.businessId, businessId))
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
  businessId: string;
}

const PurchaseCard: React.FC<PurchaseCardProps> = async ({ businessId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(purchases)
    .where(eq(purchases.businessId, businessId))
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

interface CategoryCardProps {
  businessId: string;
}

const CategoryCard: React.FC<CategoryCardProps> = async ({ businessId }) => {
  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(categories)
    .where(eq(categories.businessId, businessId))
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

const CardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="w-6 h-2" />
        <Skeleton className="w-20 h-2" />
      </CardHeader>
    </Card>
  );
};

interface CardsProps {
  businessId: string;
}

export const Cards: React.FC<CardsProps> = async ({ businessId }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
      <Suspense fallback={<CardSkeleton />}>
        <OrderCard businessId={businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <PurchaseCard businessId={businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CustomerCard businessId={businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <SupplierCard businessId={businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <ProductCard businessId={businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CategoryCard businessId={businessId} />
      </Suspense>
    </div>
  );
};
