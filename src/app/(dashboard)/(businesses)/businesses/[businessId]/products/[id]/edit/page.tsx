import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Edit } from "./edit";
import { Delete } from "./delete";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { products } from "@/server/db/schema";

interface PageProps {
  params: { businessId: string; id: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const product = await db.query.products.findFirst({
    where: and(
      eq(products.businessId, params.businessId),
      eq(products.id, params.id),
    ),
  });

  if (!product) {
    redirect("/products");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Update Product</CardTitle>
          <CardDescription>
            You can update your product from here.
          </CardDescription>
        </CardHeader>
        <Edit product={product} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Product</CardTitle>
          <CardDescription>
            You can delete your product from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete product={product} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
