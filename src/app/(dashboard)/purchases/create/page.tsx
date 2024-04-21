import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Create } from "./create";
import { db } from "@/server/db";
import { rscAuth } from "@/server/lib/action";
import { products, suppliers } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const Page = async () => {
  const user = await rscAuth();

  const ps = await db.query.products.findMany({
    where: eq(products.userId, user.id),
  });

  const sups = await db.query.suppliers.findMany({
    where: eq(suppliers.userId, user.id),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Purchase</CardTitle>
        <CardDescription>You can add new purchases from here.</CardDescription>
      </CardHeader>
      <Create products={ps} suppliers={sups} />
    </Card>
  );
};

export default Page;
