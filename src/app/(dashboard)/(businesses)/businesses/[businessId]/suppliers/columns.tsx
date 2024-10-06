"use client";

import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { TSupplier } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/client/components/ui/button";
import { restoreSupplierAction } from "@/server/controllers/supplier";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";

interface ActionsProps {
  supplier: TSupplier;
}

type RestoreSupplierActionReturnType = ReturnType<typeof restoreSupplierAction>;

const Actions: React.FC<ActionsProps> = ({ supplier }) => {
  const onRestore = () => {
    const promise = new Promise<Awaited<RestoreSupplierActionReturnType>>(
      async (res, rej) => {
        const response = await restoreSupplierAction({
          businessId: supplier.businessId,
          id: supplier.id,
        });

        if (response?.data) {
          res(response);
          return;
        }

        rej(response);
      },
    );

    toast.promise(promise, {
      loading: "Please wait while we restore this supplier",
      success: "Supplier restored successfully",
      error: (err: Awaited<RestoreSupplierActionReturnType>) => {
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
        {supplier.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={`/businesses/${supplier.businessId}/suppliers/${supplier.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TSupplier>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Email address",
    cell: ({ row }) => row.original.email || "N/A",
  },
  {
    header: "Phone number",
    accessorKey: "phone",
  },
  {
    id: "Actions",
    cell: ({ row }) => <Actions supplier={row.original} />,
  },
];
