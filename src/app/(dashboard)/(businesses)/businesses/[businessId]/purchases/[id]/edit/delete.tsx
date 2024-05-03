"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { deletePurchaseAction } from "@/server/controllers/purchase";
import { useRouter } from "next/navigation";
import { TPurchase } from "@/server/db/schema";

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
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
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
