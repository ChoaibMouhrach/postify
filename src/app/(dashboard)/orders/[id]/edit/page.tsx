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
import { rscAuth } from "@/server/lib/action";
import { orders } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { Edit } from "./edit";

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.userId, user.id), eq(orders.id, params.id)),
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
          <Delete id={order.id} deleted={!!order.deletedAt} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
