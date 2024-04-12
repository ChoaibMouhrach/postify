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
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createSupplierAction } from "./action";
import { toast } from "sonner";
import { createSupplierSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo } from "react";

type Payload = z.infer<typeof createSupplierSchema>;

export const Create = () => {
  const form = useForm<Payload>({
    resolver: zodResolver(createSupplierSchema),
    values: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const { execute, status } = useAction(createSupplierAction, {
    onSuccess: () => {
      form.reset();
      toast.success("Supplier addedd successfully");
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
        <CardContent className="grid grid-cols-3 gap-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John doe" />
                </FormControl>
                <FormDescription>The name of the supplier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="example@example.com" />
                </FormControl>
                <FormDescription>
                  The email address of the supplier.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+XXX XXXXXXXXX" />
                </FormControl>
                <FormDescription>The phone of the supplier.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="address"
            render={({ field }) => (
              <FormItem className="col-start-1 col-end-4">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} placeholder="21 Jump St..." />
                </FormControl>
                <FormDescription>The address of the supplier.</FormDescription>
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
