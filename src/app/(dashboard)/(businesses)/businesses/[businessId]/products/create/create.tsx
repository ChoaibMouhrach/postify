"use client";

import { useAction } from "next-safe-action/hooks";
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
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { createProductAction } from "@/server/controllers/product";
import { createProductSchema } from "@/common/schemas/product";
import { TBusiness } from "@/server/db/schema";
import { CategoriesInput } from "@/client/components/categories-input";

type Payload = z.infer<typeof createProductSchema>;

interface CreateProps {
  business: TBusiness;
}

export const Create: React.FC<CreateProps> = ({ business }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(createProductSchema),
    values: {
      businessId: business.id,
      name: "",
      price: 1,
      unit: "",
      tax: 0,

      description: "",
      categoryId: "",
      code: "",
    },
  });

  const { execute, status } = useAction(createProductAction, {
    onSuccess: () => {
      form.reset();
      toast.success("Product created successfully");
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
        <CardContent className="grid md:grid-cols-3 gap-4">
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
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoriesInput onValueChange={field.onChange} />
                </FormControl>
                <FormDescription>The category of this product.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="kg" />
                </FormControl>
                <FormDescription>The unit of the product.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="786374234" />
                </FormControl>
                <FormDescription>The code of the product.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    step="0.001"
                    type="number"
                    placeholder="1"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(parseInt(e.target.value) || value);
                    }}
                  />
                </FormControl>
                <FormDescription>The tax of the product.</FormDescription>
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
              <FormItem className="md:col-start-1 md:col-end-4">
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
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
