"use client";

import {
  LayoutMobileSidebar,
  LayoutSidebar,
  LayoutSidebarItem,
} from "@/client/components/layout-client";
import { ClipboardCheck, Home, Store } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const links = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    name: "Businesses",
    icon: Store,
    href: "/businesses",
  },
  {
    name: "Tasks",
    icon: ClipboardCheck,
    href: "/tasks",
  },
];

interface BarProps {
  onNavigate?: () => unknown;
}

export const Bar: React.FC<BarProps> = ({ onNavigate }) => {
  const pathName = usePathname();

  return (
    <LayoutSidebar>
      {links.map((link) => (
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
