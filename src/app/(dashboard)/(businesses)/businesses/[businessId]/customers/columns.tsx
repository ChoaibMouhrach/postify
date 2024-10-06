"use client";

import { TCustomer } from "@/server/db/schema";
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
import { restoreCustomerAction } from "@/server/controllers/customer";

interface ActionsProps {
  customer: TCustomer;
}

type RestoreActionReturnType = Awaited<
  ReturnType<typeof restoreCustomerAction>
>;

const Actions: React.FC<ActionsProps> = ({ customer }) => {
  const onRestore = async () => {
    const promise = new Promise<RestoreActionReturnType>(async (res, rej) => {
      const response = await restoreCustomerAction({
        id: customer.id,
        businessId: customer.businessId,
      });

      if (response?.data) {
        res(response);
        return;
      }

      rej(response);
    });

    toast.promise(promise, {
      loading: "Restoring...",
      success: "Customer restored successfully",
      error: (error: RestoreActionReturnType) => {
        return error?.serverError || "Something went wrong";
      },
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
        {customer.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={`/businesses/${customer.businessId}/customers/${customer.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TCustomer>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Email address",
    accessorKey: "email",
    cell: ({ row }) => row.original.email || <div>N/A</div>,
  },
  {
    header: "Phone address",
    accessorKey: "phone",
  },
  {
    header: "Created at",
    accessorKey: "createdAt",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Actions",
    cell: ({ row }) => <Actions customer={row.original} />,
  },
];
