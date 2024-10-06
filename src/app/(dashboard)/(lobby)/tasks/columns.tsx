"use client";

import { Badge } from "@/client/components/ui/badge";
import { TTask, TTaskStatus, TTaskType } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { Button } from "@/client/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { restoreTaskAction } from "@/server/controllers/task";

interface ActionsProps {
  task: TTask & {
    type: TTaskType;
  };
}

type RestoreTaskActionRetutn = Awaited<ReturnType<typeof restoreTaskAction>>;

const Actions: React.FC<ActionsProps> = ({ task }) => {
  const onRestore = () => {
    const promise = new Promise<RestoreTaskActionRetutn>(async (res, rej) => {
      const response = await restoreTaskAction({
        id: task.id,
      });

      if (response?.data) {
        res(response);
        return;
      }

      rej(response);
    });

    toast.promise(promise, {
      loading: "loading...",
      success: "Task restored successfully",
      error: (error: RestoreTaskActionRetutn) => {
        return error?.serverError || "Something went wrong";
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {task.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<
  TTask & { type: TTaskType; status: TTaskStatus }
>[] = [
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type.name;

      return (
        <Badge
          variant={
            type.toLowerCase().includes("bug") ? "destructive" : "secondary"
          }
        >
          {type}
        </Badge>
      );
    },
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status.name;

      return (
        <Badge
          variant={
            status.toLowerCase().includes("progress")
              ? "secondary"
              : status.toLowerCase().includes("started")
                ? "outline"
                : "default"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Actions",
    cell: ({ row }) => <Actions task={row.original} />,
  },
];
