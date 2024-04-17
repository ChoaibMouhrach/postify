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
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCategoryAction } from "./actions";
import { useMemo } from "react";
import { toast } from "sonner";

const createCategorySchema = z.object({
  name: z.string().min(3),
});

type Payload = z.infer<typeof createCategorySchema>;

export const Create = () => {
  const form = useForm<Payload>({
    resolver: zodResolver(createCategorySchema),
    values: {
      name: "",
    },
  });

  const { execute, status } = useAction(createCategoryAction, {
    onSuccess: () => {
      toast.success("Category created successfully");
      form.reset();
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
          <Button pending={pending}>Add</Button>
        </CardFooter>
      </form>
    </Form>
  );
};
