import { SearchParams } from "@/types/nav";
import { Suppliers } from "./table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/client/components/data-table";
import { rscAuth } from "@/server/lib/action";
import { BusinessesRepo } from "@/server/repositories/business";

interface PageProps {
  searchParams: SearchParams;
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ searchParams, params }) => {
  const user = await rscAuth();

  await BusinessesRepo.rscFindOrThrow(params.businessId, user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers</CardTitle>
        <CardDescription>
          You can manage your suppliers from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<DataTableSkeleton />}>
          <Suppliers
            businessId={params.businessId}
            searchParams={searchParams}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
