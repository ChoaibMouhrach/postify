"use client";

import { Button } from "@/client/components/ui/button";
import { setupAction } from "@/server/controllers/auth";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const Setup = () => {
  const router = useRouter();

  const { execute: setup, isExecuting: isSettingUp } = useAction(setupAction, {
    onSuccess: () => {
      toast.success("Setup completed successfully");
      router.push("/sign-in");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
    },
  });

  const onSetup = () => {
    setup();
  };

  return (
    <Button pending={isSettingUp} onClick={onSetup}>
      Setup
    </Button>
  );
};
