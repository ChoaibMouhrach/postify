"use client";

import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { deleteCategoryAction } from "@/server/controllers/category";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TCategory } from "@/server/db/schema";

interface DeleteProps {
  category: TCategory;
}

export const Delete: React.FC<DeleteProps> = ({ category }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteCategoryAction, {
    onSuccess: () => {
      toast.success("Category deleted successfully");
      router.push(`/businesses/${category.businessId}/categories`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({ id: category.id, businessId: category.businessId });
  };

  return (
    <Button pending={pending} onClick={onDelete} variant="destructive">
      {category.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
