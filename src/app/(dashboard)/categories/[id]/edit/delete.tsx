"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { deleteCategoryAction } from "@/server/controllers/category";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const router = useRouter();
  const { execute, status } = useAction(deleteCategoryAction, {
    onSuccess: () => {
      toast.success("Category deleted successfully");
      router.push("/categories");
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
