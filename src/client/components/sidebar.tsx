"use client";

import { LucideIcon, Menu } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/client/components/ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

export type ILink = {
  name: string;
  href: string;
  icon: LucideIcon;
};

interface SidebarItemProps {
  link: ILink;
  pathName: string;
  onNavigate?: () => unknown;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  onNavigate,
  link,
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
  }, [pathName, link]);

  return (
    <Button
      key={link.name}
      variant={active ? "secondary" : "ghost"}
      className={cn("justify-start", !active ? "text-muted-foreground" : "")}
      size="sm"
      asChild
    >
      <Link onClick={onNavigate} href={link.href}>
        <link.icon className="w-4 h-4" />
        {link.name}
      </Link>
    </Button>
  );
};

interface SidebarProps {
  links: ILink[];
  className?: string;
  onNavigate?: () => unknown;
  businessId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  links,
  className,
  businessId,
}) => {
  const pathName = usePathname();

  return (
    <div className={cn("flex flex-col gap-2 p-4", className)}>
      {links.map((link) => (
        <SidebarItem
          onNavigate={onNavigate}
          key={link.href}
          link={{
            ...link,
            href: businessId
              ? `/businesses/${businessId}${link.href}`
              : link.href,
          }}
          pathName={pathName}
        />
      ))}
    </div>
  );
};

interface MobileSidebarProps {
  links: ILink[];
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ links }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-4 gap-6">
          <SheetHeader>
            <SheetTitle className="px-2 text-start">Navigations</SheetTitle>
          </SheetHeader>
          <Sidebar
            onNavigate={() => setOpen(false)}
            links={links}
            className="p-0 mt-4"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
