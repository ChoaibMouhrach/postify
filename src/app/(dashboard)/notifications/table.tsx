"use client";

import { TNotification } from "@/server/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import React, { useMemo } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import {
  markAllAsReadAction,
  markAsReadAction,
} from "@/server/controllers/notification";
import { toast } from "sonner";
import { cn } from "@/client/lib/utils";
import { Button } from "@/client/components/ui/button";
import { useUpdateSearchParams } from "@/client/hooks/search-params";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useAction } from "next-safe-action/hooks";
import { Separator } from "@/client/components/ui/separator";

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

  const { execute, status } = useAction(markAllAsReadAction, {
    onSuccess: () => {
      toast.success("All notifications are marked as read");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

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

  const onReadAll = () => {
    execute({});
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
      <div>
        <Button size="sm" pending={pending} onClick={onReadAll}>
          {!pending && <Check className="w-4 h-4" />}
          Mark all as read
        </Button>
      </div>

      <Separator />

      {data.length ? (
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
      ) : (
        <div className="text-muted-foreground">No notifications found</div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <p>
          Page {page} of {lastPage || 1}
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
