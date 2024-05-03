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
import { updateBusinessSchema } from "@/common/schemas/business";
import { updateBusinessAction } from "@/server/controllers/business";
import { TBusiness } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Payload = z.infer<typeof updateBusinessSchema>;

interface BusinessEditProps {
  business: TBusiness;
}

export const BusinessEdit: React.FC<BusinessEditProps> = ({ business }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(updateBusinessSchema),
    values: {
      id: business.id,
      name: business.name,
      phone: business.phone,
      currency: business.currency,
      email: business.email || "",
      address: business.address || "",
    },
  });

  const { execute, status } = useAction(updateBusinessAction, {
    onSuccess: () => {
      toast.success("Business updated successfully");
      form.reset();
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
        <CardContent className="grid lg:grid-cols-3 gap-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Yera..." />
                </FormControl>
                <FormDescription>The name of the business.</FormDescription>
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
                <FormDescription>
                  The phone number of the business.
                </FormDescription>
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
                  <Input {...field} placeholder="example@example.com..." />
                </FormControl>
                <FormDescription>
                  The email address of the business.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="MAD..." />
                </FormControl>
                <FormDescription>The currency of the business.</FormDescription>
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
                  <Textarea
                    {...field}
                    rows={8}
                    placeholder="21 Jump street..."
                  />
                </FormControl>
                <FormDescription>The address of the business.</FormDescription>
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
