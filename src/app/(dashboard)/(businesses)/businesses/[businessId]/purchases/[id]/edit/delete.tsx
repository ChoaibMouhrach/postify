"use client";

import { toast } from "sonner";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TPurchase } from "@/server/db/schema";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/client/components/ui/button";
import { deletePurchaseAction } from "@/server/controllers/purchase";

interface DeleteProps {
  purchase: TPurchase;
}

export const Delete: React.FC<DeleteProps> = ({ purchase }) => {
  const router = useRouter();

  const { execute, status } = useAction(deletePurchaseAction, {
    onSuccess: () => {
      toast.success("Purchase deleted successfully");
      router.push(`/businesses/${purchase.businessId}/purchases`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({
      id: purchase.id,
      businessId: purchase.businessId,
    });
  };

  return (
    <Button pending={pending} onClick={onDelete} variant="destructive">
      {purchase.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
