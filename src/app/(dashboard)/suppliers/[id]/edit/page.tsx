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
import { suppliers } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { Edit } from "./edit";

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();
  const supplier = await db.query.suppliers.findFirst({
    where: and(eq(suppliers.id, params.id), eq(suppliers.userId, user.id)),
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
          <Delete id={supplier.id} permDelete={!!supplier.deletedAt} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
