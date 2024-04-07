"use client";

import { Button } from "@/client/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
});

type Payload = z.infer<typeof schema>;

export const SignIn = () => {
  const [pending, setPending] = useState(false);

  const form = useForm<Payload>({
    resolver: zodResolver(schema),
    values: {
      email: "",
    },
  });

  const onSubmit = async (payload: Payload) => {
    setPending(true);
    try {
      await signIn("email", {
        email: payload.email,
        redirect: false,
        callbackUrl: "/",
      });

      toast.success(
        "We've emailed you a link for authentication. Please use it to log in.",
      );

      form.reset();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
    setPending(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="example@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button pending={pending}>Sign in</Button>
      </form>
    </Form>
  );
};
