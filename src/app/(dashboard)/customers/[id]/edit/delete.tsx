"use client";

import { useAction } from "next-safe-action/hooks";
import { Button } from "@/client/components/ui/button";
import { deleteCustomerAction } from "./action";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

interface DeleteProps {
  id: string;
}

export const Delete: React.FC<DeleteProps> = ({ id }) => {
  const router = useRouter();
  const { execute, status } = useAction(deleteCustomerAction, {
    onSuccess: () => {
      router.push("/customers");
      toast.success("Customer deleted successfully");
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
