"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/client/components/ui/form";
import { Input } from "@/client/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { signInAction } from "@/server/controllers/auth";
import { Button } from "@/client/components/ui/button";

const schema = z.object({
  email: z.string().email(),
});

type Payload = z.infer<typeof schema>;

export const SignIn = () => {
  const form = useForm<Payload>({
    resolver: zodResolver(schema),
    values: {
      email: "",
    },
  });

  const { execute: signIn, isExecuting: isSigningIn } = useAction(
    signInAction,
    {
      onSuccess: () => {
        toast.success(
          "We've emailed you a link for authentication. Please use it to log in.",
        );
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Something went wrong");
      },
    },
  );

  const onSubmit = async (payload: Payload) => {
    signIn(payload);
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

        <Button pending={isSigningIn}>Sign in</Button>
      </form>
    </Form>
  );
};
