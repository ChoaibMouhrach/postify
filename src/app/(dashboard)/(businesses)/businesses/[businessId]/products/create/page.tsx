import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import React from "react";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Product</CardTitle>
        <CardDescription>You can add new products from here.</CardDescription>
      </CardHeader>
      <Create business={business} />
    </Card>
  );
};

export default Page;
