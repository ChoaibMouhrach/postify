"use client";

import { Button } from "@/client/components/ui/button";
import { removeTaskAction } from "@/server/controllers/task";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { toast } from "sonner";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const { execute, status } = useAction(removeTaskAction, {
    onSuccess: () => {
      toast.success("Task deleted successfully");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onRemove = () => {
    execute({ id });
  };

  return (
    <Button onClick={onRemove} pending={pending} variant="destructive">
      {deleted ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
