import { SearchParams } from "@/types/nav";
import { Customers } from "./table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Suspense } from "react";

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = ({ searchParams }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          You can manage your customers from here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback="loading...">
          <Customers searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
