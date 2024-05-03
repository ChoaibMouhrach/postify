"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { deleteProductAction } from "@/server/controllers/product";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TProduct } from "@/server/db/schema";

interface DeleteProps {
  product: TProduct;
}

export const Delete: React.FC<DeleteProps> = ({ product }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteProductAction, {
    onSuccess: () => {
      toast.success("Product deleted successfully");
      router.push(`/businesses/${product.businessId}/products`);
    },
    onError: (err) => {
      toast.error(err.serverError);
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({ id: product.id, businessId: product.businessId });
  };

  return (
    <Button onClick={onDelete} pending={pending} variant="destructive">
      {product.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
