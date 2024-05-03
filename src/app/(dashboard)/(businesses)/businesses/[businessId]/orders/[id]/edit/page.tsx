import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { orders } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { Edit } from "./edit";

interface PageProps {
  params: {
    id: string;
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.businessId, params.businessId),
      eq(orders.id, params.id),
    ),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/orders");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit order</CardTitle>
          <CardDescription>You can edit this order from here.</CardDescription>
        </CardHeader>
        <Edit order={order} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete order</CardTitle>
          <CardDescription>
            You can delete this order from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete order={order} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
