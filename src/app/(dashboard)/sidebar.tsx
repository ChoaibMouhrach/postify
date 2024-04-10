"use client";

import { Button } from "@/client/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/client/components/ui/sheet";
import { cn } from "@/client/lib/utils";
import {
  Box,
  ChevronUp,
  Home,
  Menu,
  Shapes,
  ShoppingBasket,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { Logo } from "@/client/components/logo";

const links = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    name: "Products",
    icon: Box,
    href: "/products",
  },
  {
    name: "Categories",
    icon: Shapes,
    href: "/categories",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    href: "/orders",
  },
  {
    name: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    name: "Purchases",
    icon: ShoppingBasket,
    href: "/purchases",
  },
  {
    name: "Suppliers",
    icon: Truck,
    href: "/suppliers",
  },
];

interface SideBarItemProps {
  link: (typeof links)[number];
  onNavigate?: () => void;
}

const SideBarItem: React.FC<SideBarItemProps> = ({ link, onNavigate }) => {
  const pathname = usePathname();

  const active = useMemo(() => {
    let active = false;

    if (pathname.startsWith(link.href)) {
      active = true;

      if (link.href === "/" && pathname !== "/") {
        active = false;
      }
    }

    return active;
  }, [link, pathname]);

  return (
    <Button
      size="sm"
      asChild
      variant={active ? "secondary" : "ghost"}
      onClick={onNavigate}
      className={cn(
        "justify-start gap-3 border border-transparent",
        active ? "border-border" : "text-muted-foreground",
      )}
    >
      <Link href={link.href}>
        <link.icon className="w-4 h-4" />
        {link.name}
      </Link>
    </Button>
  );
};

interface SideBarProps {
  className?: string;
  onNavigate?: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({ className, onNavigate }) => {
  const session = useSession();

  return (
    <header
      className={cn(
        "w-60 fixed left-0 top-0 h-[100dvh] lg:flex flex-col hidden",
        className,
      )}
    >
      <div className="pt-4 px-7 flex items-center gap-1">
        <Logo className="fill-foreground w-6 h-6" />
        <h1 className="text-2xl font-bold">YeraPos</h1>
      </div>
      <ScrollArea className="gap-1 flex-1">
        <div className="p-4 flex flex-col gap-1">
          {links.map((link, index) => (
            <SideBarItem onNavigate={onNavigate} link={link} key={index} />
          ))}
        </div>
      </ScrollArea>
      <div className="pb-4 px-4 flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary">
              {session.status === "loading"
                ? "Loading..."
                : session.data?.user.email.slice(0, 15)}
              ...
              <ChevronUp className="w-4 h-4 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="DropdownMenuContent">
            <DropdownMenuItem asChild>
              <Link onClick={onNavigate} href="/notifications">
                Notifications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link onClick={onNavigate} href="/settings">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link onClick={onNavigate} href="/sign-out">
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export const MobileSideBar = () => {
  const [open, setOpen] = useState(false);

  const onNavigate = () => {
    setOpen(false);
  };

  return (
    <div className="h-16 flex items-center px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0" side="left">
          <SideBar onNavigate={onNavigate} className="flex w-full static" />
        </SheetContent>
      </Sheet>
    </div>
  );
};