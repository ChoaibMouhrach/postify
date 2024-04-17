"use client";

import { Button } from "@/client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { TCategory } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import React from "react";
import { restoreCategoryAction } from "./actions";
import { toast } from "sonner";

interface ActionsProps {
  category: TCategory;
}

const Actions: React.FC<ActionsProps> = ({ category }) => {
  const { execute } = useAction(restoreCategoryAction, {
    onSuccess: () => {
      toast.success("Category restored successfully");
    },
    onError: (err) => {
      toast.error(err.serverError);
    },
  });

  const onRestore = () => {
    execute({
      id: category.id,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {category.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/categories/${category.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TCategory>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions category={row.original} />,
  },
];
