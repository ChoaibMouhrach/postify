"use client";

import { Button } from "@/client/components/ui/button";
import { signOutAction } from "@/server/controllers/auth";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const SignOut = () => {
  const router = useRouter();

  const { execute: signOut, isExecuting: isSigningOut } = useAction(
    signOutAction,
    {
      onSuccess: () => {
        toast.success("See you later!");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Something went wrong");
      },
    },
  );

  const onBack = () => {
    router.back();
  };

  const onSignOut = async () => {
    signOut();
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button disabled={isSigningOut} onClick={onBack}>
        Back
      </Button>
      <Button onClick={onSignOut} pending={isSigningOut} variant="outline">
        Sign Out
      </Button>
    </div>
  );
};
