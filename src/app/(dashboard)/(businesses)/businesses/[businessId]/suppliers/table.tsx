import { DataTable } from "@/client/components/data-table";
import { TSupplier } from "@/server/db/schema";
import { SearchParams } from "@/types/nav";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { getSuppliersAction } from "@/server/controllers/supplier";
import { redirect } from "next/navigation";

interface SuppliersProps {
  searchParams: SearchParams;
  businessId: string;
}

export const Suppliers: React.FC<SuppliersProps> = async ({
  searchParams,
  businessId,
}) => {
  const response = await getSuppliersAction({
    ...searchParams,
    businessId,
  });

  if (response?.serverError) {
    redirect(`/500?message=${response.serverError}`);
  }

  if (!response?.data) {
    redirect(`/500?message=Something went wrong`);
  }

  return (
    <DataTable<TSupplier>
      // data
      data={response.data.data}
      columns={columns}
      // meta
      query={response.data.query}
      trash={response.data.trash}
      from={response.data.from}
      to={response.data.to}
      // pagination
      page={response.data.page}
      lastPage={response.data.lastPage}
    >
      <Button asChild>
        <Link href={`/businesses/${businessId}/suppliers/create`}>
          New supplier
        </Link>
      </Button>
    </DataTable>
  );
};
