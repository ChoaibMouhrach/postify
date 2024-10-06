"use client";

import { Button } from "@/client/components/ui/button";
import { TBusiness } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { restoreBusinessAction } from "@/server/controllers/business";
import { toast } from "sonner";

type RestoreBusinessReturn = Awaited<ReturnType<typeof restoreBusinessAction>>;

interface ActionsProps {
  business: TBusiness;
}

const Actions: React.FC<ActionsProps> = ({ business }) => {
  const onRestore = () => {
    const promise = new Promise<RestoreBusinessReturn>(async (res, rej) => {
      const response = await restoreBusinessAction({
        id: business.id,
      });

      if (response?.data) {
        res(response);
        return;
      }

      rej(response);
    });

    toast.promise(promise, {
      success: "Business restored successfully",
      loading: "Please wait while we restore this business",
      error: (err: RestoreBusinessReturn) => {
        return err?.serverError || "Something went wrong";
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
        {business.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/businesses/${business.id}/dashboard`}>Manage</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TBusiness>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Phone",
    accessorKey: "phone",
  },
  {
    header: "Currency",
    cell: ({ row }) => row.original.currency,
  },
  {
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Options",
    cell: ({ row }) => <Actions business={row.original} />,
  },
];
