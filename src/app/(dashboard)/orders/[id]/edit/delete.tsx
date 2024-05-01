"use client";

import { Button } from "@/client/components/ui/button";
import { deleteOrderAction } from "@/server/controllers/order";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

interface DeleteProps {
  id: string;
  deleted: boolean;
}

export const Delete: React.FC<DeleteProps> = ({ id, deleted }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteOrderAction, {
    onSuccess: () => {
      toast.success("Order deleted successfully");
      router.push("/orders");
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
    <Button variant="destructive" pending={pending} onClick={onDelete}>
      {deleted ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
