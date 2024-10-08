"use client";

import { z } from "zod";
import { toast } from "sonner";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { Form } from "@/client/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import { createPurchaseSchema } from "@/common/schemas/purchase";
import { createPurchaseAction } from "@/server/controllers/purchase";
import { SupplierInput } from "@/client/components/suppliers-input";
import { ProductsInput } from "./products-input";

type RawPayload = z.infer<typeof createPurchaseSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & {
    name: string;
  })[];
}

interface CreateProps {
  businessId: string;
}

export const Create: React.FC<CreateProps> = ({ businessId }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(createPurchaseSchema),
    values: {
      businessId,
      supplierId: "",
      products: [],
    },
  });

  const { execute, status } = useAction(createPurchaseAction, {
    onSuccess: () => {
      toast.success("Purchase created successfully");
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const onSubmit = (payload: Payload) => {
    execute(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-4">
          <SupplierInput
            businessId={businessId}
            value={form.getValues("supplierId")}
            onValueChange={(supplierId: string) =>
              form.setValue("supplierId", supplierId)
            }
          />
          <ProductsInput businessId={businessId} form={form} />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
