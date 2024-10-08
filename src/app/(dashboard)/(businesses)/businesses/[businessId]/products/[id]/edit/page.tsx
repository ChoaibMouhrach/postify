import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Edit } from "./edit";
import { Delete } from "./delete";
import { BusinessesRepo } from "@/server/repositories/business";
import { ProductRepo } from "@/server/repositories/product";
import { redirect } from "next/navigation";
import React from "react";
import { validateRequest } from "@/server/lib/auth";

interface PageProps {
  params: { businessId: string; id: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const business = await BusinessesRepo.find({
    id: params.businessId,
    userId: user.id,
  });

  if (!business) {
    redirect("/businesses");
  }

  const product = await ProductRepo.find({
    id: params.id,
    businessId: business.data.id,
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
        <Edit product={product.data} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Product</CardTitle>
          <CardDescription>
            You can delete your product from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete product={product.data} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
