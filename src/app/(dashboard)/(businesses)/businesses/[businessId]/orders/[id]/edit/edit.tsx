"use client";

import { CardContent, CardFooter } from "@/client/components/ui/card";
import { updateOrderAction } from "@/server/controllers/order";
import { TBusiness, TOrder, TOrderItem, TProduct } from "@/server/db/schema";
import { Button } from "@/client/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/client/components/ui/form";
import { CustomerInput } from "./customer-input";
import { ProductsInput } from "./products-input";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { z } from "zod";
import { updateOrderSchema } from "@/common/schemas/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Textarea } from "@/client/components/ui/textarea";
import { Input } from "@/client/components/ui/input";

type RawPayload = z.infer<typeof updateOrderSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & TProduct)[];
}

interface EditProps {
  business: TBusiness;
  order: TOrder & {
    items: (TOrderItem & { product: TProduct })[];
  };
}

export const Edit: React.FC<EditProps> = ({ order, business }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(updateOrderSchema),
    values: {
      id: order.id,
      businessId: order.businessId,
      customerId: order.customerId || "",
      shippingAddress: order.shippingAddress || "",
      note: order.note || "",
      products: order.items.map((item) => ({
        ...item.product,
        id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        tax: item.tax,
      })),
    },
  });

  const { execute, status } = useAction(updateOrderAction, {
    onSuccess: () => {
      toast.success("Order updated successfully");
    },
    onError: ({ error }) => {
      toast.error(error.serverError);
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
          <Button pending={pending}>Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
