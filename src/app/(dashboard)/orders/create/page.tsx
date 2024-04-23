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
        <CardTitle>New order</CardTitle>
        <CardDescription>You can add new order from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
