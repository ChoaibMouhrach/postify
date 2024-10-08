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
import Link from "next/link";
import React from "react";
import { restoreCategoryAction } from "@/server/controllers/category";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface ActionsProps {
  category: TCategory;
}

const Actions: React.FC<ActionsProps> = ({ category }) => {
  const params = useParams();
  const businessId = params.businessId as string;

  const onRestore = async () => {
    const promise = new Promise(async (res, rej) => {
      const response = await restoreCategoryAction({
        id: category.id,
        businessId,
      });

      if (response?.data) {
        res(response);
        return;
      }

      rej(response);
    });

    toast.promise(promise, {
      loading: "Please wait while we restore this category",
      success: "Category restored successfully",
      error: (err) => err.serverError || "Something went wrong",
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
          <Link
            href={`/businesses/${businessId}/categories/${category.id}/edit`}
          >
            Edit
          </Link>
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
