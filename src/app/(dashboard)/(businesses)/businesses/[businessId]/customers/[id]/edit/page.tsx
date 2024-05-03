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
import { customers } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { Edit } from "./edit";

interface PageProps {
  params: {
    id: string;
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const customer = await db.query.customers.findFirst({
    where: and(
      eq(customers.id, params.id),
      eq(customers.businessId, params.businessId),
    ),
  });

  if (!customer) {
    redirect(`/businesses/${params.businessId}/customers`);
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
        <Edit customer={customer} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Customer</CardTitle>
          <CardDescription>
            You can delete your customer from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete customer={customer} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
