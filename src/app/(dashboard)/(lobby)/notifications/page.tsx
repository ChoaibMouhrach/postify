import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { NotificationSkeleton, Notifications } from "./table";
import { SearchParams } from "@/types/nav";
import React, { Suspense } from "react";
import { getNotificationsAction } from "@/server/controllers/notification";
import { redirect } from "next/navigation";

interface NotificationsWrapperProps {
  searchParams: SearchParams;
}

const NotificationsWrapper: React.FC<NotificationsWrapperProps> = async ({
  searchParams,
}) => {
  const response = await getNotificationsAction(searchParams);

  if (response?.serverError) {
    redirect(`/500?message=${response.serverError}`);
  }

  if (!response?.data) {
    redirect("/500?message=Something went wrong");
  }

  return (
    <Notifications
      page={response.data.page}
      lastPage={response.data.lastPage}
      data={response.data.data}
    />
  );
};

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
