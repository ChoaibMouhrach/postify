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
        <CardTitle>Businesses</CardTitle>
        <CardDescription>You can add new businesses from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
