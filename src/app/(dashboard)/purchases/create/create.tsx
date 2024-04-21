"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SupplierInput } from "./suppliers";
import { Form } from "@/client/components/ui/form";
import { ProductsInput } from "./products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { toast } from "sonner";
import { createPurchaseSchema } from "@/common/schemas/purchase";
import { createPurchaseAction } from "@/server/controllers/purchase";

type RawPayload = z.infer<typeof createPurchaseSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & {
    name: string;
  })[];
}

export const Create = () => {
  const form = useForm<Payload>({
    resolver: zodResolver(createPurchaseSchema),
    values: {
      supplierId: "",
      products: [],
    },
  });

  const { execute, status } = useAction(createPurchaseAction, {
    onSuccess: () => {
      toast.success("Purchase created successfully");
      form.reset();
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
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
        <CardContent className="grid gap-4">
          <SupplierInput form={form} />
          <ProductsInput form={form} />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
