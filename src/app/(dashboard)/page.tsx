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
import { rscAuth } from "@/server/lib/action";

const Home = async () => {
  const user = await rscAuth();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Suspense fallback={<CardSkeleton />}>
        <OrderCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <PurchaseCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CustomerCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <SupplierCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <ProductCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CategoryCard userId={user.id} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <TaskCard userId={user.id} />
      </Suspense>
    </div>
  );
};

export default Home;
