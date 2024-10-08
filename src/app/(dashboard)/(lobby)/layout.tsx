import {
  LayoutBody,
  LayoutContent,
  LayoutHead,
  LayoutSidebarWrapper,
  LayoutWrapper,
} from "@/client/components/layout";
import React from "react";
import { Bar, MobileBar } from "./links";
import { validateRequest } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { RoleRepo } from "@/server/repositories/role";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    businessId: string;
  };
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

  const role = await RoleRepo.findOrThrow(user.roleId);

  return (
    <LayoutWrapper>
      <LayoutHead businessId={params.businessId}>
        <MobileBar
          user={{
            ...user,
            role: role.data,
          }}
        />
      </LayoutHead>
      <LayoutBody>
        <LayoutSidebarWrapper>
          <Bar
            user={{
              ...user,
              role: role.data,
            }}
          />
        </LayoutSidebarWrapper>
        <LayoutContent>{children}</LayoutContent>
      </LayoutBody>
    </LayoutWrapper>
  );
};

export default Layout;
