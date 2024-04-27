"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { toast } from "sonner";
import { deleteSupplierAction } from "@/server/controllers/supplier";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const { execute, status } = useAction(deleteSupplierAction, {
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
    },
    onError: (err) => {
      toast.success(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = async () => {
    execute({ id });
  };

  return (
    <Button pending={pending} onClick={onDelete} variant="destructive">
      {deleted ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
