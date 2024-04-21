"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import { Form } from "@/client/components/ui/form";
import { useForm } from "react-hook-form";
import { ProductsInput } from "./products-input";
import { SupplierInput } from "./supplier-input";
import { z } from "zod";
import { updatePurchaseSchema } from "./schema";
import { TPurchase } from "@/server/db/schema";
import { useAction } from "next-safe-action/hooks";
import { updatePurchaseAction } from "./action";
import { toast } from "sonner";
import { useMemo } from "react";

type RawPayload = z.infer<typeof updatePurchaseSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & {
    name: string;
  })[];
}

interface EditProps {
  purchase: TPurchase & {
    products: {
      id: string;
      name: string;
      quantity: number;
    }[];
  };
}

export const Edit: React.FC<EditProps> = ({ purchase }) => {
  const { execute, status } = useAction(updatePurchaseAction, {
    onSuccess: () => {
      toast.success("Purchase updated successfully");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const form = useForm<Payload>({
    values: {
      id: purchase.id,
      supplierId: purchase.supplierId,
      products: purchase.products,
    },
  });

  const onSubmit = (payload: Payload) => {
    execute(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <SupplierInput form={form} />
          <ProductsInput form={form} />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
