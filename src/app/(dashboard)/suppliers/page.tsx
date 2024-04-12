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

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = ({ searchParams }) => {
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
          <Suppliers searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
