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

const Page: React.FC<PageProps> = ({ params }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Customer</CardTitle>
        <CardDescription>You can add new customers from here.</CardDescription>
      </CardHeader>
      <Create businessId={params.businessId} />
    </Card>
  );
};

export default Page;
