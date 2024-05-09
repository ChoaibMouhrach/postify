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
import { updateAuthSchema } from "@/common/schemas/auth";
import { updateAuthAction } from "@/server/controllers/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useAction } from "next-safe-action/hooks";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ProfileFormProps {
  user: User;
}

type Payload = z.infer<typeof updateAuthSchema>;

export const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { update } = useSession();

  const form = useForm<Payload>({
    resolver: zodResolver(updateAuthSchema),
    values: {
      name: user.name || "",
    },
  });

  const { execute, status } = useAction(updateAuthAction, {
    onSuccess: () => {
      toast.success("Auth updated successfully");
      update({
        name: form.getValues("name"),
      });
    },
    onError: (err) => {
      toast.error(err.serverError || "Something went wrong");
    },
  });

  const pending = useMemo(() => status === "executing", [status]);

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
                  <Input {...field} placeholder="Jack" />
                </FormControl>
                <FormDescription>Your name.</FormDescription>
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
