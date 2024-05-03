"use client";

import { Button } from "@/client/components/ui/button";
import { TPurchase, TSupplier } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { restorePurchaseAction } from "@/server/controllers/purchase";

interface ActionsProps {
  purchase: TPurchase;
}

type RestoreProductReturn = ReturnType<typeof restorePurchaseAction>;

const Actions: React.FC<ActionsProps> = ({ purchase }) => {
  const onRestore = () => {
    const promise = new Promise<Awaited<RestoreProductReturn>>(
      async (res, rej) => {
        const response = await restorePurchaseAction({
          id: purchase.id,
          businessId: purchase.businessId,
        });

        if ("data" in response) {
          res(response);
          return;
        }

        rej(response);
      },
    );

    toast.promise(promise, {
      loading: "Please wait while we restore this purchase",
      success: "Purchase restored successfully",
      error: (err: Awaited<RestoreProductReturn>) => {
        return err.serverError || "Something went wrong";
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
        {purchase.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={`/businesses/${purchase.businessId}/purchases/${purchase.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TPurchase & { supplier: TSupplier }>[] = [
  {
    header: "Supplier",
    accessorKey: "supplier.name",
  },
  {
    header: "Total cost",
    accessorKey: "totalCost",
  },
  {
    header: "Created at",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Actions",
    cell: ({ row }) => <Actions purchase={row.original} />,
  },
];
