import { DataTable } from "@/client/components/data-table";
import { SearchParams } from "@/types/nav";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";
import { getCustomersAction } from "@/server/controllers/customer";
import { redirect } from "next/navigation";

interface CustomersProps {
  searchParams: SearchParams;
  businessId: string;
}

export const Customers: React.FC<CustomersProps> = async ({
  searchParams,
  businessId,
}) => {
  const response = await getCustomersAction({
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
    <DataTable
      data={response.data.data}
      columns={columns}
      // meta
      query={response.data.query}
      trash={response.data.trash}
      from={response.data.from}
      to={response.data.to}
      // pagination
      lastPage={response.data.lastPage}
      page={response.data.page}
    >
      <Button asChild>
        <Link href={`/businesses/${businessId}/customers/create`}>
          New customer
        </Link>
      </Button>
    </DataTable>
  );
};
