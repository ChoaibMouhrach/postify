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
import { BusinessesRepo } from "@/server/repositories/business";
import { getPurchasesActiopn } from "@/server/controllers/purchase";
import { TBusiness } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { validateRequest } from "@/server/lib/auth";

interface PurchasesWrapperProps {
  searchParams: SearchParams;
  business: TBusiness;
}

const PurchasesWrapper: React.FC<PurchasesWrapperProps> = async ({
  searchParams,
  business,
}) => {
  const response = await getPurchasesActiopn({
    ...searchParams,
    businessId: business.id,
  });

  if (response?.serverError) {
    redirect(`/purchases?message=${response.serverError}`);
  }

  if (!response?.data) {
    redirect(`/purchases?message=Something went wrong`);
  }

  return (
    <Purchases
      data={response.data.data}
      business={business}
      query={response.data.query}
      trash={response.data.trash}
      from={response.data.from}
      to={response.data.to}
      page={response.data.page}
      lastPage={response.data.lastPage}
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
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const business = await BusinessesRepo.find({
    id: params.businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

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
          <PurchasesWrapper
            business={business.data}
            searchParams={searchParams}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
