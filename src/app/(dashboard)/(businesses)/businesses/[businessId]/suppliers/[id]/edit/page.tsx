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
import { suppliers } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { Edit } from "./edit";

interface PageProps {
  params: {
    id: string;
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const supplier = await db.query.suppliers.findFirst({
    where: and(
      eq(suppliers.id, params.id),
      eq(suppliers.businessId, params.businessId),
    ),
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
        <Edit supplier={supplier} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Supplier</CardTitle>
          <CardDescription>
            You can delete this supplier from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete supplier={supplier} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
