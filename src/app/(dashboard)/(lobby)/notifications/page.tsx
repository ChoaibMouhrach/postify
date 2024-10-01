import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { db } from "@/server/db";
import { notificationsTable } from "@/server/db/schema";
import { rscAuth } from "@/server/lib/action";
import { desc, eq, sql } from "drizzle-orm";
import { NotificationSkeleton, Notifications } from "./table";
import { z } from "zod";
import { pageSchema } from "@/common/schemas";
import { SearchParams } from "@/types/nav";
import React, { Suspense } from "react";
import { RECORDS_LIMIT } from "@/common/constants";

interface NotificationsWrapperProps {
  searchParams: SearchParams;
}

const NotificationsWrapper: React.FC<NotificationsWrapperProps> = async ({
  searchParams,
}) => {
  const { page } = indexSchema.parse(searchParams);

  const user = await rscAuth();

  const data = await db.query.notificationsTable.findMany({
    where: eq(notificationsTable.userId, user.id),
    orderBy: desc(notificationsTable.createdAt),
    offset: (page - 1) * RECORDS_LIMIT,
    limit: RECORDS_LIMIT,
  });

  const count = await db
    .select({
      count: sql`COUNT(*)`.mapWith(Number),
    })
    .from(notificationsTable)
    .then((notifications) => notifications[0].count);

  const lastPage = Math.ceil(count / RECORDS_LIMIT);

  return <Notifications page={page} lastPage={lastPage} data={data} />;
};

const indexSchema = z.object({
  page: pageSchema,
});

interface PageProps {
  searchParams: SearchParams;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          You can manage your Notifications from here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Suspense fallback={<NotificationSkeleton />}>
          <NotificationsWrapper searchParams={searchParams} />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default Page;
