import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import React from "react";

interface PageProps {
  params: {
    businessId: string;
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Purchase</CardTitle>
        <CardDescription>You can add new purchases from here.</CardDescription>
      </CardHeader>
      <Create businessId={params.businessId} />
    </Card>
  );
};

export default Page;
