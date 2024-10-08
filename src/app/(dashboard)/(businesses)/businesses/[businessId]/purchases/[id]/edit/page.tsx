import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import React from "react";
import { Edit } from "./edit";
import { Delete } from "./delete";
import { BusinessesRepo } from "@/server/repositories/business";
import { PurchaseRepo } from "@/server/repositories/purchase";
import { db } from "@/server/db";
import { purchasesItems } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
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

  const purchase = await PurchaseRepo.find({
    id: params.id,
    businessId: business.data.id,
  });

  if (!purchase) {
    redirect("/purchases");
  }

  const items = await db.query.purchasesItems.findMany({
    where: eq(purchasesItems.purchaseId, purchase.data.id),
    with: {
      product: true,
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Purchase</CardTitle>
          <CardDescription>
            You can edit your purchase from here.
          </CardDescription>
        </CardHeader>
        <Edit
          purchase={{
            ...purchase.data,
            items,
          }}
        />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Purchase</CardTitle>
          <CardDescription>
            You can delete your purchase from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete purchase={purchase.data} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
