"use client";

import {
  LayoutSidebar,
  LayoutSidebarItem,
  LayoutMobileSidebar,
} from "@/client/components/layout-client";
import {
  Box,
  Home,
  LayoutDashboard,
  Shapes,
  ShoppingBasket,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    name: "Home",
    icon: Home,
    href: "/",
  },
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
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

interface BarProps {
  onNavigate?: () => unknown;
}

export const Bar: React.FC<BarProps> = ({ onNavigate }) => {
  const pathName = usePathname();
  const businessId = useParams().businessId as string;

  const l = links.map((link) => {
    if (link.href === "/") {
      return link;
    }

    return {
      ...link,
      href: `/businesses/${businessId}${link.href}`,
    };
  });

  return (
    <LayoutSidebar>
      {l.map((link) => (
        <LayoutSidebarItem
          link={link}
          key={link.name}
          pathName={pathName}
          onNavigate={onNavigate}
        />
      ))}
    </LayoutSidebar>
  );
};

export const MobileBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <LayoutMobileSidebar open={open} setOpen={setOpen}>
      <Bar onNavigate={() => setOpen(false)} />
    </LayoutMobileSidebar>
  );
};
