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
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";

interface BusinessProps {
  businessId: string;
}

export const Business: React.FC<BusinessProps> = async ({ businessId }) => {
  const user = await rscAuth();

  const business = await BusinessesRepo.rscFindOrThrow(businessId, user.id);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit business</CardTitle>
          <CardDescription>
            You can edit this business from here.
          </CardDescription>
        </CardHeader>
        <BusinessEdit business={business} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete business</CardTitle>
          <CardDescription>
            You can delete this business from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessDelete business={business} />
        </CardContent>
      </Card>
    </>
  );
};
