"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteProductAction } from "@/server/controllers/product";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteProps {
  id: string;
}

export const Delete: React.FC<DeleteProps> = ({ id }) => {
  const router = useRouter();
  const { execute, status } = useAction(deleteProductAction, {
    onSuccess: () => {
      router.push("/products");
      toast.success("Product deleted successfully");
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
      Delete
    </Button>
  );
};
