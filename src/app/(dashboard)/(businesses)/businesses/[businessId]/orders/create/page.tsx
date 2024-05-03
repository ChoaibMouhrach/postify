import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import React from "react";
import { businessRepository } from "@/server/repositories/business";
import { rscAuth } from "@/server/lib/action";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  await businessRepository.rscFindOrThrow(params.businessId, user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New order</CardTitle>
        <CardDescription>You can add new order from here.</CardDescription>
      </CardHeader>
      <Create businessId={params.businessId} />
    </Card>
  );
};

export default Page;
