"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { createOrderSchema } from "@/common/schemas/order";
import { createOrderAction } from "@/server/controllers/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProductsInput } from "./products-input";
import { CustomerInput } from "./customer-input";
import { toast } from "sonner";
import { Textarea } from "@/client/components/ui/textarea";
import { Input } from "@/client/components/ui/input";
import { TBusiness, TProduct } from "@/server/db/schema";

type RawPayload = z.infer<typeof createOrderSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & TProduct)[];
}

interface CreateProps {
  business: TBusiness;
}

export const Create: React.FC<CreateProps> = ({ business }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(createOrderSchema),
    values: {
      note: "",
      businessId: business.id,
      products: [],
      customerId: "",
      shippingAddress: "",
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
          <CustomerInput businessId={business.id} form={form} />

          <FormField
            name="shippingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="21 jump street..." />
                </FormControl>
                <FormDescription>
                  The shipping address for this order.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea
                    rows={9}
                    {...field}
                    placeholder="The payment for this order shou..."
                  />
                </FormControl>
                <FormDescription>The note for this order.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <ProductsInput business={business} form={form} />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
