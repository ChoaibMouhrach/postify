import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { BusinessEdit } from "./business-edit";
import { BusinessDelete } from "./business-delete";
import React from "react";
import { BusinessesRepo } from "@/server/repositories/business";
import { redirect } from "next/navigation";
import { validateRequest } from "@/server/lib/auth";

interface BusinessProps {
  businessId: string;
}

export const Business: React.FC<BusinessProps> = async ({ businessId }) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const business = await BusinessesRepo.find({
    id: businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit business</CardTitle>
          <CardDescription>
            You can edit this business from here.
          </CardDescription>
        </CardHeader>
        <BusinessEdit business={business.data} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete business</CardTitle>
          <CardDescription>
            You can delete this business from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessDelete business={business.data} />
        </CardContent>
      </Card>
    </>
  );
};
