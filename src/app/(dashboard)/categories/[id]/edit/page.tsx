import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Delete } from "./delete";
import { Edit } from "./edit";

const Page = async () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
          <CardDescription>
            You can edit your category from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Edit />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delete Category</CardTitle>
          <CardDescription>
            You can delete this category from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Delete />
        </CardContent>
      </Card>
    </>
  );
};

export default Page;
