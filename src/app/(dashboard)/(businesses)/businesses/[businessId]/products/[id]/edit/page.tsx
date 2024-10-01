import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Edit } from "./edit";
import { Delete } from "./delete";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";
import { productRepository } from "@/server/repositories/product";

interface PageProps {
  params: { businessId: string; id: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await BusinessesRepo.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  const product = await productRepository.rscFindOrThrow(
    params.id,
    business.id,
  );

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
