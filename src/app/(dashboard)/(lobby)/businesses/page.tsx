import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Businesses } from "./table";
import { SearchParams } from "@/types/nav";
import React from "react";

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
        <Businesses searchParams={searchParams} />
      </CardContent>
    </Card>
  );
};

export default Page;
