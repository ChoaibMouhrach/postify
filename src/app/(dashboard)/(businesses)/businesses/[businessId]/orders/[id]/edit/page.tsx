import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { ordersItems } from "@/server/db/schema";
import { Edit } from "./edit";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { OrderRepo } from "@/server/repositories/order";
import { redirect } from "next/navigation";
import React from "react";

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
    redirect("/businesses");
  }

  const order = await OrderRepo.find({
    id: params.id,
    businessId: business.data.id,
  });

  if (!order) {
    redirect("/orders");
  }

  const items = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.data.id),
    with: {
      product: true,
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit order</CardTitle>
          <CardDescription>You can edit this order from here.</CardDescription>
        </CardHeader>
        <Edit
          business={business.data}
          order={{
            ...order.data,
            items,
          }}
        />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete order</CardTitle>
          <CardDescription>
            You can delete this order from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete order={order.data} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
