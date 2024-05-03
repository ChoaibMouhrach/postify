"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { toast } from "sonner";
import { deleteSupplierAction } from "@/server/controllers/supplier";
import { useRouter } from "next/navigation";
import { TSupplier } from "@/server/db/schema";

interface DeleteProps {
  supplier: TSupplier;
}

export const Delete: React.FC<DeleteProps> = ({ supplier }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteSupplierAction, {
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      router.push(`/businesses/${supplier.businessId}/suppliers`);
    },
    onError: (err) => {
      toast.success(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = async () => {
    execute({ id: supplier.id, businessId: supplier.businessId });
  };

  return (
    <Button pending={pending} onClick={onDelete} variant="destructive">
      {supplier.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
