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

interface ActionsProps {
  customer: TCustomer;
}

const Actions: React.FC<ActionsProps> = ({ customer }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
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
