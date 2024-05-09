"use client";

import { Button } from "@/client/components/ui/button";
import { CardContent, CardFooter } from "@/client/components/ui/card";
import { TCustomer } from "@/server/db/schema";
import { useForm } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { Textarea } from "@/client/components/ui/textarea";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { toast } from "sonner";
import { updateCustomerAction } from "@/server/controllers/customer";
import { updateCustomerSchema } from "@/common/schemas/customer";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditProps {
  customer: TCustomer;
}

type Payload = z.infer<typeof updateCustomerSchema>;

export const Edit: React.FC<EditProps> = ({ customer }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(updateCustomerSchema),
    values: {
      businessId: customer.businessId,
      id: customer.id,
      name: customer.name,
      address: customer.address || "",
      email: customer.email || "",
      phone: customer.phone,
      code: customer.code || "",
    },
  });

  const { execute, status } = useAction(updateCustomerAction, {
    onSuccess: () => {
      toast.success("Customer updated successfully");
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
        <CardContent className="grid md:grid-cols-3 gap-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John doe" />
                </FormControl>
                <FormDescription>The name of this customer.</FormDescription>
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
                  <Input {...field} placeholder="3239482398" />
                </FormControl>
                <FormDescription>The code of this customer.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="example@example.com"
                  />
                </FormControl>
                <FormDescription>
                  The email address of this customer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+XXX XXXXXXXXX" />
                </FormControl>
                <FormDescription>The phone of this customer.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="address"
            render={({ field }) => (
              <FormItem className="lg:col-start-1 lg:col-end-4">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} placeholder="21 Jump str..." />
                </FormControl>
                <FormDescription>The address of this customer.</FormDescription>
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
