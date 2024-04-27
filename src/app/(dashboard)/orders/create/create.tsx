"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import { Form } from "@/client/components/ui/form";
import { createOrderSchema } from "@/common/schemas/order";
import { createOrderAction } from "@/server/controllers/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductsInput } from "./products-input";
import { CustomerInput } from "./customer-input";
import { toast } from "sonner";

type RawPayload = z.infer<typeof createOrderSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & {
    name: string;
  })[];
}

export const Create = () => {
  const form = useForm<Payload>({
    resolver: zodResolver(createOrderSchema),
    values: {
      customerId: "",
      products: [],
    },
  });

  const { execute, status } = useAction(createOrderAction, {
    onSuccess: () => {
      toast.success("Order created successfully");
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
        <CardContent className="flex flex-col gap-4">
          <CustomerInput form={form} />
          <ProductsInput form={form} />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
