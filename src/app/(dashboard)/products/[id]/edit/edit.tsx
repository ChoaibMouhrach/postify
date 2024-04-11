"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { TProduct } from "@/server/db/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateProductSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { updateProductAction } from "./action";
import { useMemo } from "react";
import { toast } from "sonner";

interface EditProps {
  product: TProduct;
}

type Payload = z.infer<typeof updateProductSchema>;

export const Edit: React.FC<EditProps> = ({ product }) => {
  const { execute, status } = useAction(updateProductAction, {
    onSuccess: () => {
      toast.success("Product updated successfully");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const form = useForm<Payload>({
    resolver: zodResolver(updateProductSchema),
    values: {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || "",
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
        <CardContent className="grid grid-cols-3 gap-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Asu..." />
                </FormControl>
                <FormDescription>The name of the product.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        parseFloat(e.target.value) || e.target.value,
                      )
                    }
                    type="number"
                    placeholder="15..."
                  />
                </FormControl>
                <FormDescription>The price of the product.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            render={({ field }) => (
              <FormItem className="col-start-1 col-end-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={8}
                    {...field}
                    placeholder="This product is..."
                  />
                </FormControl>
                <FormDescription>
                  The description of the product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button pending={pending}>Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
