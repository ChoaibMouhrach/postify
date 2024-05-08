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
import { businessRepository } from "@/server/repositories/business";
import { orderRepository } from "@/server/repositories/order";

interface PageProps {
  params: {
    id: string;
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  const order = await orderRepository.rscFindOrThrow(params.id, business.id);

  const items = await db.query.ordersItems.findMany({
    where: eq(ordersItems.orderId, order.id),
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
          business={business}
          order={{
            ...order,
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
          <Delete order={order} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
