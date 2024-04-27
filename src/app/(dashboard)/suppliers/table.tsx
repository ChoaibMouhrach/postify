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
  const { data, trash, query, page, lastPage } =
    await getSuppliersAction(searchParams);

  return (
    <DataTable<TSupplier>
      data={data}
      columns={columns}
      lastPage={lastPage}
      page={page}
      query={query}
      trash={trash}
    >
      <Button asChild>
        <Link href="/suppliers/create">New supplier</Link>
      </Button>
    </DataTable>
  );
};
