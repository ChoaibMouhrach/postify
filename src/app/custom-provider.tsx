"use client";

import { Toaster } from "@/client/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

interface CustomProviderProps {
  children: React.ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
  return (
    <>
      <SessionProvider>{children}</SessionProvider>
      <Toaster expand />
      <ProgressBar
        height="4px"
        color="hsl(var(--primary))"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};
