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
        <CardTitle>New Supplier</CardTitle>
        <CardDescription>You can add new suppliers from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
