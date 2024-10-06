import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import React from "react";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

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
        <CardTitle>New category</CardTitle>
        <CardDescription>You can add new categories from here.</CardDescription>
      </CardHeader>
      <Create businessId={business.data.id} />
    </Card>
  );
};

export default Page;
