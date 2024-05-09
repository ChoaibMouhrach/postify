import React from "react";
import { Logo } from "./logo";
import { rscAuth } from "@/server/lib/action";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { db } from "@/server/db";
import { and, eq, sql } from "drizzle-orm";
import { businesses, notifications } from "@/server/db/schema";
import { BusinessesSwitchCMP } from "./layout-client";

interface LayoutSidebarWrapperProps {
  children: React.ReactNode;
}

export const LayoutSidebarWrapper: React.FC<LayoutSidebarWrapperProps> = ({
  children,
}) => {
  return (
    <ScrollArea className="w-64 border-r  shrink-0  hidden lg:block">
      <div className="p-4">{children}</div>
    </ScrollArea>
  );
};

const Profile = async () => {
  const user = await rscAuth();

  const notificationsCount = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, false)),
    )
    .then((recs) => parseInt(recs[0].count));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary text-primary-foreground w-8 h-8 rounded-full ml-auto relative">
        {user.name?.charAt(0).toUpperCase() || "Y"}
        {!!notificationsCount && (
          <div className="bg-red-700 w-2 h-2 rounded-full ml-2 absolute top-0 right-0" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex flex-col">
          {user.name || "My Account"}
          <span className="text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications">
            Notifications
            {!!notificationsCount && (
              <div className="bg-red-700 w-2 h-2 rounded-full ml-2" />
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/sign-out">Sign Out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface BusinessesSwitchProps {
  businessId: string;
}

const BusinessesSwitch: React.FC<BusinessesSwitchProps> = async ({
  businessId,
}) => {
  const user = await rscAuth();

  const data = await db.query.businesses.findMany({
    where: eq(businesses.userId, user.id),
  });

  return <BusinessesSwitchCMP value={businessId} businesses={data} />;
};

interface LayoutHeadProps {
  children: React.ReactNode;
  businessId: string;
}

export const LayoutHead: React.FC<LayoutHeadProps> = ({
  children,
  businessId,
}) => {
  return (
    <div className="h-16  border-b shrink-0 flex items-center px-4 gap-4">
      {children}
      <Link href="/">
        <Logo />
      </Link>
      {businessId && <BusinessesSwitch businessId={businessId} />}
      <Profile />
    </div>
  );
};

interface LayoutBodyProps {
  children: React.ReactNode;
}

export const LayoutBody: React.FC<LayoutBodyProps> = ({ children }) => {
  return (
    <div className="flex-1 overflow-auto flex items-stretch">{children}</div>
  );
};

interface LayoutContentProps {
  children: React.ReactNode;
}

export const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-secondary">
      {children}
    </div>
  );
};

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return <main className="h-[100dvh] flex flex-col">{children}</main>;
};
