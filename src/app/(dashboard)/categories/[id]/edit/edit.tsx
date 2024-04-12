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
import { useForm } from "react-hook-form";

export const Edit = () => {
  const pending = false;
  const form = useForm();

  const onSubmit = () => {
    //
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid lg:grid-cols-3 gap-4">
          <FormField
            name=""
            render={() => (
              <FormItem>
                <FormLabel></FormLabel>
                <FormControl></FormControl>
                <FormDescription></FormDescription>
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
