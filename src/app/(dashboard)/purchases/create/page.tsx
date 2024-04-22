import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";

const Page = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Purchase</CardTitle>
        <CardDescription>You can add new purchases from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
