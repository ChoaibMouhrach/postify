import React, { Suspense } from "react";
import {
  CardSkeleton,
  CategoryCard,
  CustomerCard,
  OrderCard,
  ProductCard,
  PurchaseCard,
  SupplierCard,
} from "./cards";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Suspense fallback={<CardSkeleton />}>
        <OrderCard businessId={params.businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <PurchaseCard businessId={params.businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CustomerCard businessId={params.businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <SupplierCard businessId={params.businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <ProductCard businessId={params.businessId} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CategoryCard businessId={params.businessId} />
      </Suspense>
    </div>
  );
};

export default Page;
