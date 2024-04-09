"use client";

import { Button } from "@/client/components/ui/button";
import { TProduct } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { restoreProductAction } from "./actions";
import React from "react";
import { toast } from "sonner";

interface ActionsProps {
  product: TProduct;
}

const Actions: React.FC<ActionsProps> = ({ product }) => {
  const onRestore = () => {
    toast.promise(restoreProductAction({ id: product.id }), {
      loading: "Please wait while we restore this product",
      success: "Product restored successfully",
      error: (err) => err.message,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/products/${product.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TProduct>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Price",
    accessorKey: "price",
  },
  {
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Options",
    cell: ({ row }) => <Actions product={row.original} />,
  },
];
