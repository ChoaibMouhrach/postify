import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import { purchases } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { Edit } from "./edit";
import { Delete } from "./delete";
import { rscAuth } from "@/server/lib/action";

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const purchase = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, user.id), eq(purchases.id, params.id)),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!purchase) {
    redirect("/purchases");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Purchase</CardTitle>
          <CardDescription>
            You can edit your purchase from here.
          </CardDescription>
        </CardHeader>
        <Edit purchase={purchase} />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Purchase</CardTitle>
          <CardDescription>
            You can delete your purchase from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete id={purchase.id} deleted={!!purchase.deletedAt} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
