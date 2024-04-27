"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { deleteCategoryAction } from "@/server/controllers/category";
import { toast } from "sonner";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const { execute, status } = useAction(deleteCategoryAction, {
    onSuccess: () => {
      toast.success("Category deleted successfully");
    },
    onError: (err) => {
      toast.error(err.serverError);
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({ id });
  };

  return (
    <Button pending={pending} onClick={onDelete} variant="destructive">
      {deleted ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
