import { TCustomer } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<TCustomer>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Created at",
    accessorKey: "createdAt",
  },
];
