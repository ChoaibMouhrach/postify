import { Suspense } from "react";
import {
  CardSkeleton,
  CategoryCard,
  CustomerCard,
  OrderCard,
  ProductCard,
  PurchaseCard,
  SupplierCard,
  TaskCard,
} from "./cards";

const Home = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Suspense fallback={<CardSkeleton />}>
        <OrderCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <PurchaseCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CustomerCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <SupplierCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <ProductCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CategoryCard />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <TaskCard />
      </Suspense>
    </div>
  );
};

export default Home;
