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
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { updateCategorySchema } from "@/common/schemas/category";
import { updateCategoryAction } from "@/server/controllers/category";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { TCategory } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface EditProps {
  category: TCategory;
}

type Payload = z.infer<typeof updateCategorySchema>;

export const Edit: React.FC<EditProps> = ({ category }) => {
  const { execute, status } = useAction(updateCategoryAction, {
    onSuccess: () => {
      toast.success("Category updated successfully");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => {
    return status === "executing";
  }, [status]);

  const form = useForm<Payload>({
    resolver: zodResolver(updateCategorySchema),
    values: {
      id: category.id,
      businessId: category.businessId,
      name: category.name,
    },
  });

  const onSubmit = (payload: Payload) => {
    execute(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Iron" />
                </FormControl>
                <FormDescription>The name of the category.</FormDescription>
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
