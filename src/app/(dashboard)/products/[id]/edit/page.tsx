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
import { redirect } from "next/navigation";
import { rscAuth } from "@/server/lib/action";

interface PageProps {
  params: Params & { id: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const product = await productRepository.find(params.id, user.id);

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
          <Delete id={product.id} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
