import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { Edit } from "./edit";
import { businessRepository } from "@/server/repositories/business";
import { rscAuth } from "@/server/lib/action";
import { customerRepository } from "@/server/repositories/customer";

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

  const customer = await customerRepository.rscFindOrThrow(
    params.id,
    business.id,
  );

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
