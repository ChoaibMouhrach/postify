"use client";

import {
  LayoutMobileSidebar,
  LayoutSidebar,
  LayoutSidebarItem,
} from "@/client/components/layout-client";
import { ROLES } from "@/common/constants";
import { TRole, TUser } from "@/server/db/schema";
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
    role: ROLES.ADMIN,
    name: "Tasks",
    icon: ClipboardCheck,
    href: "/tasks",
  },
];

interface BarProps {
  onNavigate?: () => unknown;
  user: TUser & {
    role: TRole;
  };
}

export const Bar: React.FC<BarProps> = ({ onNavigate, user }) => {
  const pathName = usePathname();

  return (
    <LayoutSidebar>
      {links.map((link) => {
        if (link.role && user.role.name !== link.role) {
          return;
        }

        return (
          <LayoutSidebarItem
            link={link}
            key={link.name}
            pathName={pathName}
            onNavigate={onNavigate}
          />
        );
      })}
    </LayoutSidebar>
  );
};

interface MobileBarProps {
  user: TUser & {
    role: TRole;
  };
}

export const MobileBar: React.FC<MobileBarProps> = ({ user }) => {
  const [open, setOpen] = useState(false);

  return (
    <LayoutMobileSidebar open={open} setOpen={setOpen}>
      <Bar onNavigate={() => setOpen(false)} user={user} />
    </LayoutMobileSidebar>
  );
};
