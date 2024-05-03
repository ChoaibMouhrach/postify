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
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { categories } from "@/server/db/schema";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    businessId: string;
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, params.id),
      eq(categories.businessId, params.businessId),
    ),
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
