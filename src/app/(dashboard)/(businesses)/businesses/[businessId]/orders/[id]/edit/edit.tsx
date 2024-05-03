"use client";

import { CardContent, CardFooter } from "@/client/components/ui/card";
import { updateOrderAction } from "@/server/controllers/order";
import { TOrder, TProduct } from "@/server/db/schema";
import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { Form } from "@/client/components/ui/form";
import { CustomerInput } from "./customer-input";
import { ProductsInput } from "./products-input";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { z } from "zod";
import { updateOrderSchema } from "@/common/schemas/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

type RawPayload = z.infer<typeof updateOrderSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & {
    name: string;
  })[];
}

interface EditProps {
  order: TOrder & {
    items: {
      quantity: number;
      product: TProduct;
    }[];
  };
}

export const Edit: React.FC<EditProps> = ({ order }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(updateOrderSchema),
    values: {
      businessId: order.businessId,
      id: order.id,
      customerId: order.customerId || "",
      products: order.items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
      })),
    },
  });

  const { execute, status } = useAction(updateOrderAction, {
    onSuccess: () => {
      toast.success("Order updated successfully");
    },
    onError: (err) => {
      toast.error(err.serverError);
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
          <CustomerInput businessId={order.businessId} form={form} />
          <ProductsInput businessId={order.businessId} form={form} />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
