import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { Edit } from "./edit";
import { BusinessesRepo } from "@/server/repositories/business";
import { CustomerRepo } from "@/server/repositories/customer";
import { redirect } from "next/navigation";
import React from "react";
import { validateRequest } from "@/server/lib/auth";

interface PageProps {
  params: {
    id: string;
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
    redirect("/businesses");
  }

  const customer = await CustomerRepo.find({
    id: params.id,
    businessId: business.data.id,
  });

  if (!customer) {
    redirect("/customers");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
          <CardDescription>
            You can edit your customer from here.
          </CardDescription>
        </CardHeader>
        <Edit customer={customer.data} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Customer</CardTitle>
          <CardDescription>
            You can delete your customer from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete customer={customer.data} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
