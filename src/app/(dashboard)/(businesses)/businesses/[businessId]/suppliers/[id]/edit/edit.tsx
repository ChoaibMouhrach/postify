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
import { TSupplier } from "@/server/db/schema";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { toast } from "sonner";
import { updateSupplierSchema } from "@/common/schemas/supplier";
import { updateSupplierAction } from "@/server/controllers/supplier";

type Payload = z.infer<typeof updateSupplierSchema>;

interface EditProps {
  supplier: TSupplier;
}

export const Edit: React.FC<EditProps> = ({ supplier }) => {
  const { execute, status } = useAction(updateSupplierAction, {
    onSuccess: () => {
      toast.success("Supplier updated successfully");
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const form = useForm<Payload>({
    resolver: zodResolver(updateSupplierSchema),
    values: {
      businessId: supplier.businessId,
      id: supplier.id,
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
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
              <FormItem className="md:col-start-1 md:col-end-4">
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
          <Button pending={pending}>Save</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
