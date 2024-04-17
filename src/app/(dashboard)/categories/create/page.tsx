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
        <CardTitle>New category</CardTitle>
        <CardDescription>You can add new categories from here.</CardDescription>
      </CardHeader>
      <Create />
    </Card>
  );
};

export default Page;
