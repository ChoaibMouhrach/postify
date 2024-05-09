"use client";

import { TCustomer, TOrder, TOrderType } from "@/server/db/schema";
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
import { ORDER_TYPES } from "@/common/constants";
import { Badge } from "@/client/components/ui/badge";

interface ActionsProps {
  order: TOrder;
}

type RestoreOrderReturn = Awaited<ReturnType<typeof restoreOrderAction>>;

const Actions: React.FC<ActionsProps> = ({ order }) => {
  const onRestore = () => {
    const promise = new Promise<RestoreOrderReturn>(async (res, rej) => {
      const response = await restoreOrderAction({
        id: order.id,
        businessId: order.businessId,
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
        <DropdownMenuItem asChild>
          <Link
            scroll
            href={`/businesses/${order.businessId}/orders?id=${order.id}`}
          >
            View
          </Link>
        </DropdownMenuItem>

        {order.deletedAt && (
          <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link
            href={`/businesses/${order.businessId}/orders/${order.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type Columns = (
  // eslint-disable-next-line no-unused-vars
  currency: string,
) => ColumnDef<TOrder & { customer: TCustomer | null; type: TOrderType }>[];

export const columns: Columns = (currency) => [
  {
    header: "Customer",
    cell: ({ row }) => row.original.customer?.name || "N/A",
  },
  {
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type.name;

      return (
        <Badge variant={type === ORDER_TYPES.CUSTOMER ? "default" : "outline"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    },
  },
  {
    header: "Total price",
    cell: ({ row }) => (
      <span>
        {row.original.totalPrice} {currency}
      </span>
    ),
  },
  {
    header: "Created at",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: "Actions",
    cell: ({ row }) => <Actions order={row.original} />,
  },
];
