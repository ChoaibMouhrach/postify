import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Categories } from "./table";
import { SearchParams } from "@/types/nav";
import React from "react";

interface PageProps {
  searchParams: SearchParams;
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = ({ searchParams, params }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>
          You can manage your categories from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Categories
          businessId={params.businessId}
          searchParams={searchParams}
        />
      </CardContent>
    </Card>
  );
};

export default Page;
