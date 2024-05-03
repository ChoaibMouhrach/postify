import { DataTableSkeleton } from "@/client/components/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import React, { Suspense } from "react";
import { Tasks } from "./table";
import { SearchParams } from "@/types/nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = ({ searchParams }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>You can manage your tasks from here.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<DataTableSkeleton />}>
          <Tasks searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
