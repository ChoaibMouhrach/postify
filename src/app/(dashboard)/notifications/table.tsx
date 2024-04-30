"use client";

import { TNotification } from "@/server/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { markAsReadAction } from "@/server/controllers/notification";
import { toast } from "sonner";
import { cn } from "@/client/lib/utils";
import { Button } from "@/client/components/ui/button";
import { useUpdateSearchParams } from "@/client/hooks/search-params";
import { Skeleton } from "@/client/components/ui/skeleton";

interface NotificationsProps {
  data: TNotification[];
  page: number;
  lastPage: number;
}

type MarkAsReadActionReturn = Awaited<ReturnType<typeof markAsReadAction>>;

export const Notifications: React.FC<NotificationsProps> = ({
  data,
  page,
  lastPage,
}) => {
  const { update } = useUpdateSearchParams();

  const onNext = () => {
    update({
      key: "page",
      value: String(page + 1),
    });
  };

  const onPrevious = () => {
    update({
      key: "page",
      value: String(page - 1),
    });
  };

  const onRead = (id: string) => {
    const promise = new Promise<MarkAsReadActionReturn>(async (res, rej) => {
      const response = await markAsReadAction({ id });

      if ("data" in response) {
        res(response);
        return;
      }

      rej(response);
    });

    toast.promise(promise, {
      loading: "Please wait while we mark this notification as read.",
      success: "Notification is successfully marked as read",
      error: (err: MarkAsReadActionReturn) => {
        return err.serverError || "Something went wrong";
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {data.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "flex items-center justify-between border rounded-md p-4",
              notification.read ? "bg-secondary" : "",
            )}
          >
            <div>
              <span>{notification.title}</span>
              <p className="text-muted-foreground">
                {notification.description}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onRead(notification.id)}>
                  Mark as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p>
          Page {page} of {lastPage}
        </p>
        <div className="flex items-center gap-4">
          <Button
            disabled={page === 1}
            onClick={onPrevious}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            disabled={page + 1 > lastPage}
            onClick={onNext}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export const NotificationSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <div className="gap-4 flex items-center">
        <Skeleton className="h-2 w-16" />

        <Skeleton className="w-[100px] h-9 ml-auto shrink-0" />
        <Skeleton className="w-[100px] h-9 shrink-0" />
      </div>
    </>
  );
};
