"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import { Form } from "@/client/components/ui/form";
import { useForm } from "react-hook-form";
import { ProductsInput } from "./products-input";
import { SupplierInput } from "./supplier-input";
import { z } from "zod";
import { TProduct, TPurchase } from "@/server/db/schema";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useMemo } from "react";
import { updatePurchaseSchema } from "@/common/schemas/purchase";
import { updatePurchaseAction } from "@/server/controllers/purchase";
import { zodResolver } from "@hookform/resolvers/zod";

type RawPayload = z.infer<typeof updatePurchaseSchema>;
export interface Payload extends RawPayload {
  products: (RawPayload["products"][number] & {
    name: string;
  })[];
}

interface EditProps {
  purchase: TPurchase & {
    items: {
      product: TProduct;
      quantity: number;
      cost: number;
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
    resolver: zodResolver(updatePurchaseSchema),
    values: {
      id: purchase.id,
      supplierId: purchase.supplierId,
      products: purchase.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        cost: item.cost,
      })),
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
