import { rscAuth } from "@/server/lib/action";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { LucideIcon } from "lucide-react";
import { MobileSidebar, Sidebar } from "./sidebar";
import { Logo } from "./logo";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/server/db";
import { and, eq, sql } from "drizzle-orm";
import { notifications } from "@/server/db/schema";

interface DashboardWrapperProps {
  children: React.ReactNode;
  businessId: string;
  links: {
    name: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export const DashboardWrapper: React.FC<DashboardWrapperProps> = async ({
  children,
  links,
  businessId,
}) => {
  const user = await rscAuth();

  const count = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, false)),
    )
    .then((recs) => parseInt(recs[0].count));

  return (
    <>
      <div className="h-16 flex items-center px-4 border-b gap-4">
        <MobileSidebar links={links} />
        <Logo />
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-auto relative">
            {user.image ? (
              <Image src={user.image} width="30" height="30" alt="profile" />
            ) : (
              <div className="w-8 h-8 text-sm rounded-full flex items-center justify-center text-center shrink-0 bg-primary text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() || "Y"}
              </div>
            )}
            {!!count && (
              <div className="w-2 h-2 rounded-full bg-red-700 absolute top-0 right-0" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                Notifications
                {count > 0 && (
                  <div className="w-2 h-2 rounded-full bg-red-700 ml-2" />
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sign-out">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 flex items-stretch overflow-auto">
        <div className="w-48 border-r hidden lg:block">
          <Sidebar businessId={businessId} links={links} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-secondary">
          {children}
        </div>
      </div>
    </>
  );
};
