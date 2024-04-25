import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import React from "react";
import { db } from "@/server/db";
import { unstable_noStore } from "next/cache";

const Page = async () => {
  unstable_noStore();
  const types = await db.query.taskTypes.findMany();

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
        <CardDescription>You can add new tasks from here.</CardDescription>
      </CardHeader>
      <Create types={types} />
    </Card>
  );
};

export default Page;
