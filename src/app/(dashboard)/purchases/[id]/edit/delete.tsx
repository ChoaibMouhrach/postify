"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { deletePurchaseAction } from "@/server/controllers/purchase";
import { useRouter } from "next/navigation";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const router = useRouter();

  const { execute, status } = useAction(deletePurchaseAction, {
    onSuccess: () => {
      toast.success("Purchase deleted successfully");
      router.push("/purchases");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({
      id,
    });
  };

  return (
    <Button pending={pending} onClick={onDelete} variant="destructive">
      {deleted ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
