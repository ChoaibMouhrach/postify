"use client";

import { useAction } from "next-safe-action/hooks";
import { Button } from "@/client/components/ui/button";
import { deleteCustomerAction } from "@/server/controllers/customer";
import { useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TCustomer } from "@/server/db/schema";

interface DeleteProps {
  customer: TCustomer;
}

export const Delete: React.FC<DeleteProps> = ({ customer }) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteCustomerAction, {
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      router.push(`/businesses/${customer.businessId}/customers`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onDelete = () => {
    execute({
      id: customer.id,
      businessId: customer.businessId,
    });
  };

  return (
    <Button onClick={onDelete} pending={pending} variant="destructive">
      {customer.deletedAt ? "Permanent deletion" : "Delete"}
    </Button>
  );
};
