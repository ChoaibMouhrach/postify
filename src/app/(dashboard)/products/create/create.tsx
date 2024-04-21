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
import { useMemo } from "react";
import { toast } from "sonner";
import { createProductAction } from "@/server/controllers/product";
import { createProductSchema } from "@/common/schemas/product";

type Payload = z.infer<typeof createProductSchema>;

export const Create = () => {
  const form = useForm<Payload>({
    resolver: zodResolver(createProductSchema),
    values: {
      name: "",
      price: 1,
      description: "",
    },
  });

  const { execute, status } = useAction(createProductAction, {
    onSuccess: () => {
      form.reset();
      toast.success("Product created successfully");
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
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
