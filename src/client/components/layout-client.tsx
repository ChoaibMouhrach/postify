"use client";

import { LucideIcon, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/client/components/ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";
import React, { useMemo } from "react";
import { cn } from "../lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { TBusiness } from "@/server/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { useRouter } from "next/navigation";

interface LayoutSidebarItemProps {
  onNavigate?: () => unknown;
  pathName: string;
  link: {
    name: string;
    href: string;
    icon: LucideIcon;
  };
}

export const LayoutSidebarItem: React.FC<LayoutSidebarItemProps> = ({
  link,
  onNavigate,
  pathName,
}) => {
  const active = useMemo(() => {
    let active = false;

    if (pathName.startsWith(link.href)) {
      active = true;

      if (link.href === "/" && pathName !== "/") {
        active = false;
      }
    }

    return active;
  }, [link.href, pathName]);

  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      className={cn("justify-start", active ? "" : "text-muted-foreground")}
      size="sm"
    >
      <Link onClick={onNavigate} href={link.href}>
        <link.icon className="w-4 h-4" />
        {link.name}
      </Link>
    </Button>
  );
};

interface LayoutSidebarProps {
  children: React.ReactNode;
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({ children }) => {
  return <div className="flex flex-col gap-2">{children}</div>;
};

interface LayoutMobileSidebarProps {
  open: boolean;
  children: React.ReactNode;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LayoutMobileSidebar: React.FC<LayoutMobileSidebarProps> = ({
  children,
  open,
  setOpen,
}) => {
  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-start">
              Are you absolutely sure?
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">{children}</ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface BusinessesSwitchCMPProps {
  businesses: TBusiness[];
  value: string;
}

export const BusinessesSwitchCMP: React.FC<BusinessesSwitchCMPProps> = ({
  businesses,
  value,
}) => {
  const router = useRouter();

  const onValueChange = (value: string) => {
    router.push(`/businesses/${value}/dashboard`);
  };

  return (
    <Select defaultValue={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select business" />
      </SelectTrigger>
      <SelectContent>
        {businesses.map((business) => (
          <SelectItem key={business.id} value={business.id}>
            {business.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
