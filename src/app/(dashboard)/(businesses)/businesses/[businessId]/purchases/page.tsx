import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Purchases } from "./table";
import React, { Suspense } from "react";
import { DataTableSkeleton } from "@/client/components/data-table";
import { SearchParams } from "@/types/nav";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";
import { getPurchasesActiopn } from "@/server/controllers/purchase";
import { TBusiness } from "@/server/db/schema";

interface PurchasesWrapperProps {
  searchParams: SearchParams;
  business: TBusiness;
}

const PurchasesWrapper: React.FC<PurchasesWrapperProps> = async ({
  searchParams,
  business,
}) => {
  const { data, query, trash, from, to, page, lastPage } =
    await getPurchasesActiopn({
      ...searchParams,
      businessId: business.id,
    });

  return (
    <Purchases
      data={data}
      business={business}
      query={query}
      trash={trash}
      from={from}
      to={to}
      page={page}
      lastPage={lastPage}
    />
  );
};

interface PageProps {
  searchParams: SearchParams;
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ searchParams, params }) => {
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchases</CardTitle>
        <CardDescription>
          You can manage your purchases from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<DataTableSkeleton />}>
          <PurchasesWrapper business={business} searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
