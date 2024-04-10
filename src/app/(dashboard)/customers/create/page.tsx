import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";

const Page = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Customer</CardTitle>
        <CardDescription>You can add new customers from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
