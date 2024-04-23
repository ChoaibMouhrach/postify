"use client";

import { TCustomer, TOrder } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { restoreOrderAction } from "@/server/controllers/order";

interface ActionsProps {
  order: TOrder;
}

type RestoreOrderReturn = Awaited<ReturnType<typeof restoreOrderAction>>;

const Actions: React.FC<ActionsProps> = ({ order }) => {
  const onRestore = () => {
    const promise = new Promise<RestoreOrderReturn>(async (res, rej) => {
      const response = await restoreOrderAction({
        id: order.id,
      });

      if ("data" in response) {
        res(response);
        return;
      }

      rej(response);
    });

    toast.promise(promise, {
      loading: "loading...",
      success: "Order restored successfully",
      error: (err: RestoreOrderReturn) =>
        err.serverError || "Something went wrong",
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
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {order.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/orders/${order.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TOrder & { customer: TCustomer }>[] = [
  {
    header: "Customer",
    accessorKey: "customer.name",
  },
  {
    header: "Total price",
    accessorKey: "totalPrice",
  },
  {
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Actions",
    cell: ({ row }) => <Actions order={row.original} />,
  },
];
