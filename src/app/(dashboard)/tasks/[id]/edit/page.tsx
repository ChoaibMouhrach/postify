import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import { tasks } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { and, eq } from "drizzle-orm";
import React from "react";
import { Delete } from "./delete";
import { redirect } from "next/navigation";
import { Edit } from "./edit";

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const user = await rscAuth();

  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.userId, user.id), eq(tasks.id, params.id)),
  });

  if (!task) {
    redirect(`/tasks`);
  }

  const types = await db.query.taskTypes.findMany();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit task</CardTitle>
          <CardDescription>You can update this task from here.</CardDescription>
        </CardHeader>
        <Edit task={task} types={types} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete task</CardTitle>
          <CardDescription>You can delete this task from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Delete id={task.id} deleted={!!task.deletedAt} />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
