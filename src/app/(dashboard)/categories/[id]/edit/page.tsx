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
import { rscAuth } from "@/server/lib/action";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, params.id), eq(categories.userId, user.id)),
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
          <Delete id={category.id} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
