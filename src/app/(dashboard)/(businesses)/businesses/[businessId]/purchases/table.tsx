"use client";

import { DataTable } from "@/client/components/data-table";
import { TBusiness, TPurchase, TSupplier } from "@/server/db/schema";
import { columns } from "./columns";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";

interface purchasesProps {
  // data
  data: (TPurchase & { supplier: TSupplier })[];
  business: TBusiness;

  // meta
  query: string;
  trash: boolean;
  from?: string;
  to?: string;

  // pagination
  page: number;
  lastPage: number;
}

export const Purchases: React.FC<purchasesProps> = async ({
  data,
  business,
  query,
  trash,
  from,
  to,
  page,
  lastPage,
}) => {
  return (
    <DataTable<TPurchase & { supplier: TSupplier }>
      data={data}
      columns={columns(business.currency)}
      // meta
      trash={trash}
      query={query}
      from={from}
      to={to}
      // pagination
      page={page}
      lastPage={lastPage}
    >
      <Button asChild>
        <Link href={`/businesses/${business.id}/purchases/create`}>
          New purchase
        </Link>
      </Button>
    </DataTable>
  );
};
