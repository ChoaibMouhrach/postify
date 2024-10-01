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
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { purchaseRepository } from "@/server/repositories/purchase";
import { db } from "@/server/db";
import { purchasesItems } from "@/server/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: {
    id: string;
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await BusinessesRepo.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  const purchase = await purchaseRepository.rscFindOrThrow(
    params.id,
    business.id,
  );

  const items = await db.query.purchasesItems.findMany({
    where: eq(purchasesItems.purchaseId, purchase.id),
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
            ...purchase,
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
          <Delete purchase={purchase} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
