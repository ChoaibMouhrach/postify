import { DataTable } from "@/client/components/data-table";
import { SearchParams } from "@/types/nav";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { getCustomersAction } from "@/server/controllers/customer";

interface CustomersProps {
  searchParams: SearchParams;
}

export const Customers: React.FC<CustomersProps> = async ({ searchParams }) => {
  const { data, lastPage, page, query, trash, from, to } =
    await getCustomersAction(searchParams);

  return (
    <DataTable
      data={data}
      columns={columns}
      // meta
      query={query}
      trash={trash}
      from={from}
      to={to}
      // pagination
      lastPage={lastPage}
      page={page}
    >
      <Button asChild>
        <Link href="/customers/create">New customer</Link>
      </Button>
    </DataTable>
  );
};
