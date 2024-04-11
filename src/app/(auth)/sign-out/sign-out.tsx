"use client";

import { Button } from "@/client/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SignOut = () => {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const onBack = () => {
    router.back();
  };

  const onSignOut = async () => {
    setPending(true);
    try {
      await signOut({
        callbackUrl: "/sign-in",
      });

      toast.success("See you soon!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }

      setPending(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={onBack}>Back</Button>
      <Button onClick={onSignOut} pending={pending} variant="outline">
        Sign Out
      </Button>
    </div>
  );
};
