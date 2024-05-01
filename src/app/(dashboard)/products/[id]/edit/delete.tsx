"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteProductAction } from "@/server/controllers/product";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteProductAction, {
    onSuccess: () => {
      toast.success("Product deleted successfully");
      router.push("/products");
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
    <Button onClick={onDelete} pending={pending} variant="destructive">
      {deleted ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
