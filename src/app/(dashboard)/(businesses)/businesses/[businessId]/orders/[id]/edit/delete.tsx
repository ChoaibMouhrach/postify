"use client";

import { Button } from "@/client/components/ui/button";
import { deleteOrderAction } from "@/server/controllers/order";
import { TOrder } from "@/server/db/schema";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

interface DeleteProps {
  order: TOrder;
}

export const Delete: React.FC<DeleteProps> = ({ order }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteOrderAction, {
    onSuccess: () => {
      toast.success("Order deleted successfully");
      router.push(`/businesses/${order.businessId}/orders`);
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
      id: order.id,
      businessId: order.businessId,
    });
  };

  return (
    <Button variant="destructive" pending={pending} onClick={onDelete}>
      {order.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
