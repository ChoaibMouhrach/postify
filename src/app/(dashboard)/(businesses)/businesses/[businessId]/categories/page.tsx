import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Categories } from "./table";
import { SearchParams } from "@/types/nav";
import React from "react";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";

interface PageProps {
  searchParams: SearchParams;
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ searchParams, params }) => {
  const user = await rscAuth();

  await businessRepository.rscFindOrThrow(params.businessId, user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>
          You can manage your categories from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Categories
          businessId={params.businessId}
          searchParams={searchParams}
        />
      </CardContent>
    </Card>
  );
};

export default Page;
