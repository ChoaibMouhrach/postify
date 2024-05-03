import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { Edit } from "./edit";
import React from "react";
import { categoryRepository } from "@/server/repositories/category";
import { businessRepository } from "@/server/repositories/business";
import { rscAuth } from "@/server/lib/action";

interface PageProps {
  params: {
    businessId: string;
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await businessRepository.rscFindOrThrow(
    params.businessId,
    user.id,
  );

  const category = await categoryRepository.rscFindOrThrow(
    params.id,
    business.id,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
          <CardDescription>
            You can edit your category from here.
          </CardDescription>
        </CardHeader>
        <Edit category={category} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Category</CardTitle>
          <CardDescription>
            You can delete this category from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete category={category} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
