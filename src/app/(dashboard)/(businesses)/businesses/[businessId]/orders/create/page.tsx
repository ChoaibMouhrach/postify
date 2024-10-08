import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import React from "react";
import { BusinessesRepo } from "@/server/repositories/business";
import { redirect } from "next/navigation";
import { validateRequest } from "@/server/lib/auth";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const business = await BusinessesRepo.find({
    id: params.businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/orders");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New order</CardTitle>
        <CardDescription>You can add new order from here.</CardDescription>
      </CardHeader>
      <Create business={business.data} />
    </Card>
  );
};

export default Page;
