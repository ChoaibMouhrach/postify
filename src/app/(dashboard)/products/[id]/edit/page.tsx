import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Edit } from "./edit";
import { Delete } from "./delete";
import { Params } from "@/types/nav";
import { productRepository } from "@/server/repositories/product";
import { authOptions } from "@/server/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface PageProps {
  params: Params & { id: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/products");
  }

  const product = await productRepository.find(params.id, session.user.id);

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
        <Edit />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Product</CardTitle>
          <CardDescription>
            You can delete your product from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete id={product.id} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
