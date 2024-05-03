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
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  await businessRepository.rscFindOrThrow(params.businessId, user.id);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
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
