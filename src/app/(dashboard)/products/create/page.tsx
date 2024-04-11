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
        <CardTitle>New Product</CardTitle>
        <CardDescription>You can add new products from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
