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
import { CategoryRepo } from "@/server/repositories/category";
import { BusinessesRepo } from "@/server/repositories/business";
import { rscAuth } from "@/server/lib/action";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    businessId: string;
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const business = await BusinessesRepo.find({
    id: params.businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

  const category = await CategoryRepo.find({
    id: params.id,
    businessId: business.data.id,
  });

  if (!category) {
    redirect("/categories");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
          <CardDescription>
            You can edit your category from here.
          </CardDescription>
        </CardHeader>
        <Edit category={category.data} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Category</CardTitle>
          <CardDescription>
            You can delete this category from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete category={category.data} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
