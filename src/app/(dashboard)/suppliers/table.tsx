import { DataTable } from "@/client/components/data-table";
import { TSupplier } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { getSuppliersAction } from "@/server/controllers/supplier";

interface SuppliersProps {
  searchParams: SearchParams;
}

export const Suppliers: React.FC<SuppliersProps> = async ({ searchParams }) => {
  const { data, trash, query, page, lastPage, from, to } =
    await getSuppliersAction(searchParams);

  return (
    <DataTable<TSupplier>
      // data
      data={data}
      columns={columns}
      // meta
      query={query}
      trash={trash}
      from={from}
      to={to}
      // pagination
      page={page}
      lastPage={lastPage}
    >
      <Button asChild>
        <Link href="/suppliers/create">New supplier</Link>
      </Button>
    </DataTable>
  );
};
