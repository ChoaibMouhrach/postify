"use client";

import { Button } from "@/client/components/ui/button";
import { deleteBusinessAction } from "@/server/controllers/business";
import { TBusiness } from "@/server/db/schema";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { toast } from "sonner";

interface BusinessDeleteProps {
  business: TBusiness;
}

export const BusinessDelete: React.FC<BusinessDeleteProps> = ({ business }) => {
  const router = useRouter();
  const { execute, status } = useAction(deleteBusinessAction, {
    onSuccess: () => {
      toast.success("Business Deleted successfully");
      router.push("/businesses");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({ id: business.id });
  };

  return (
    <Button onClick={onDelete} pending={pending} variant="destructive">
      {business.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
