"use client";

import React from "react";
import { Toaster } from "@/client/components/ui/sonner";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface CustomProviderProps {
  children: React.ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
  const [client] = useState(new QueryClient());

  return (
    <>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
      <Toaster closeButton />
      <ProgressBar
        height="4px"
        color="hsl(var(--primary))"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};
