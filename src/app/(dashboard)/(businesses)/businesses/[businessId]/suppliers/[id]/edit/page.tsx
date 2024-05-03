import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { Edit } from "./edit";
import { rscAuth } from "@/server/lib/action";
import { businessRepository } from "@/server/repositories/business";
import { supplierRepository } from "@/server/repositories/supplier";

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

  const supplier = await supplierRepository.rscFindOrThrow(
    params.id,
    business.id,
  );

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
