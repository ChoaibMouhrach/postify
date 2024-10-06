"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
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
import { useForm } from "react-hook-form";
import { TTask, TTaskStatus, TTaskType } from "@/server/db/schema";
import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateTaskSchema } from "@/common/schemas/task";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { updateTaskAction } from "@/server/controllers/task";

interface EditProps {
  statuses: TTaskStatus[];
  types: TTaskType[];
  task: TTask;
}

type Payload = z.infer<typeof updateTaskSchema>;

export const Edit: React.FC<EditProps> = ({ types, statuses, task }) => {
  const form = useForm<Payload>({
    resolver: zodResolver(updateTaskSchema),
    values: {
      id: task.id,
      title: task.title,
      description: task.description || "",
      typeId: task.typeId,
      statusId: task.statusId,
    },
  });

  const { execute, status } = useAction(updateTaskAction, {
    onSuccess: () => {
      toast.success("Task updated successfully");
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
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
        <CardContent className="grid gap-4">
          <FormField
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>The type of this task.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="statusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>The status of this task.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Do some..." />
                </FormControl>
                <FormDescription>The title for this task.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} placeholder="Stqrt by..." />
                </FormControl>
                <FormDescription>
                  The description for this task.
                </FormDescription>
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
