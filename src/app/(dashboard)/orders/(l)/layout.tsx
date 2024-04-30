"use client";

import { cn } from "@/client/lib/utils";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

interface LayoutProps {
  children: React.ReactNode;
  order: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, order }) => {
  const searchParams = useSearchParams();
  const id = useMemo(() => {
    return searchParams.get("id") || false;
  }, [searchParams]);

  return (
    <div
      className={cn("flex flex-col md:grid gap-4", id ? "lg:grid-cols-5" : "")}
    >
      <div className={cn(id ? "md:col-start-1 col-end-4" : "")}>{children}</div>
      <div className={cn(id ? "md:col-start-4 col-end-6" : "")}>{order}</div>
    </div>
  );
};

export default Layout;
