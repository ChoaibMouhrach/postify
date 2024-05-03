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

const Profile = async () => {
  const user = await rscAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary text-primary-foreground w-8 h-8 rounded-full ml-auto">
        {user.name?.charAt(0).toUpperCase() || "Y"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="flex flex-col">
          My Account
          <span className="text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications">Notifications</Link>
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

interface LayoutSidebarWrapperProps {
  children: React.ReactNode;
}

export const LayoutSidebarWrapper: React.FC<LayoutSidebarWrapperProps> = ({
  children,
}) => {
  return (
    <ScrollArea className="w-48 border-r  shrink-0  hidden lg:block">
      <div className="p-4">{children}</div>
    </ScrollArea>
  );
};

interface LayoutHeadProps {
  children: React.ReactNode;
}

export const LayoutHead: React.FC<LayoutHeadProps> = ({ children }) => {
  return (
    <div className="h-16  border-b shrink-0 flex items-center px-4 gap-4">
      {children}
      <Link href="/">
        <Logo />
      </Link>
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
