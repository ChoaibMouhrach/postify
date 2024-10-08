import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Businesses } from "./table";
import { SearchParams } from "@/types/nav";
import React, { Suspense } from "react";
import { DataTableSkeleton } from "@/client/components/data-table";

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = ({ searchParams }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Businesses</CardTitle>
        <CardDescription>
          You can manage your businesses from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<DataTableSkeleton />}>
          <Businesses searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
