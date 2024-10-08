import { DataTable } from "@/client/components/data-table";
import { Button } from "@/client/components/ui/button";
import { TTask, TTaskStatus, TTaskType } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import Link from "next/link";
import React from "react";
import { columns } from "./columns";
import { getTasksAction } from "@/server/controllers/task";
import { redirect } from "next/navigation";

interface TasksProps {
  searchParams: SearchParams;
}

export const Tasks: React.FC<TasksProps> = async ({ searchParams }) => {
  const response = await getTasksAction(searchParams);

  if (!response) {
    redirect("/500?message=Something went wrong");
  }

  if (response.serverError) {
    redirect(`/500?message=${response.serverError}`);
  }

  if (response.bindArgsValidationErrors || response.validationErrors) {
    redirect(`/500?message=Validation errors`);
  }

  if (!response.data) {
    redirect(`/500?message=Something went wrong`);
  }

  return (
    <DataTable<TTask & { type: TTaskType; status: TTaskStatus }>
      // data
      data={response.data.data}
      columns={columns}
      // meta
      trash={response.data.trash}
      query={response.data.query}
      from={response.data.from}
      to={response.data.to}
      // pagination
      page={response.data.page}
      lastPage={response.data.lastPage}
    >
      <Button asChild>
        <Link href="/tasks/create">Add task</Link>
      </Button>
    </DataTable>
  );
};
