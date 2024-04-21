"use client";

import { TSupplier } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { Button } from "@/client/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { restoreSupplierAction } from "@/server/controllers/supplier";

interface ActionsProps {
  supplier: TSupplier;
}

type RestoreSupplierActionReturnType = ReturnType<typeof restoreSupplierAction>;

const Actions: React.FC<ActionsProps> = ({ supplier }) => {
  const [restorePending, setRestorePending] = useState(false);

  const onRestore = () => {
    const promise = new Promise<Awaited<RestoreSupplierActionReturnType>>(
      async (res, rej) => {
        const response = await restoreSupplierAction({ id: supplier.id });

        if ("data" in response) {
          res(response);
          return;
        }

        rej(response);
      },
    );

    setRestorePending(true);
    toast.promise(promise, {
      loading: "Please wait while we restore this supplier",
      success: "Supplier restored successfully",
      error: (err: Awaited<RestoreSupplierActionReturnType>) => {
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
        {supplier.deletedAt && (
          <DropdownMenuItem disabled={restorePending} onClick={onRestore}>
            Restore
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/suppliers/${supplier.id}/edit`}>Edit</Link>
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
