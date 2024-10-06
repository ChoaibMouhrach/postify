import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { Edit } from "./edit";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { SupplierRepo } from "@/server/repositories/supplier";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
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
    redirect("/business");
  }

  const supplier = await SupplierRepo.find({
    id: params.id,
    businessId: business.data.id,
  });

  if (!supplier) {
    redirect("/suppliers");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Supplier</CardTitle>
          <CardDescription>
            You can edit your supplier from here.
          </CardDescription>
        </CardHeader>
        <Edit supplier={supplier.data} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Supplier</CardTitle>
          <CardDescription>
            You can delete this supplier from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete supplier={supplier.data} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
