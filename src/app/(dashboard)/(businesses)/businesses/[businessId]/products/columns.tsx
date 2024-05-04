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
import { restoreProductAction } from "@/server/controllers/product";
import React, { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { cn } from "@/client/lib/utils";

interface ActionsProps {
  product: TProduct;
}

type RestoreProductActionReturnType = ReturnType<typeof restoreProductAction>;

const Actions: React.FC<ActionsProps> = ({ product }) => {
  const businessId = useParams().businessId as string;
  const [restorePending, setRestorePending] = useState(false);

  const onRestore = () => {
    const promise = new Promise<Awaited<RestoreProductActionReturnType>>(
      async (res, rej) => {
        const response = await restoreProductAction({
          id: product.id,
          businessId,
        });

        if ("data" in response) {
          res(response);
          return;
        }

        rej(response);
      },
    );

    setRestorePending(true);
    toast.promise(promise, {
      loading: "Please wait while we restore this product",
      success: "Product restored successfully",
      error: (err: Awaited<RestoreProductActionReturnType>) => {
        return err.serverError || "Something went wrong";
      },
      finally: () => {
        setRestorePending(false);
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
        {product.deletedAt && (
          <DropdownMenuItem disabled={restorePending} onClick={onRestore}>
            Restore
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/businesses/${businessId}/products/${product.id}/edit`}>
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// eslint-disable-next-line no-unused-vars
type Columns = (currency: string) => ColumnDef<TProduct>[];

export const columns: Columns = (currency) => [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Price",
    cell: ({ row }) => (
      <span>
        {row.original.price} {currency}
      </span>
    ),
  },
  {
    header: "Stock",
    cell: ({ row }) => (
      <span className={cn(row.original.stock < 5 ? "text-destructive" : "")}>
        {row.original.stock}
      </span>
    ),
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
