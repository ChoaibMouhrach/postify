import {
  LayoutBody,
  LayoutContent,
  LayoutHead,
  LayoutSidebarWrapper,
  LayoutWrapper,
} from "@/client/components/layout";
import React from "react";
import { Bar, MobileBar } from "./links";
import { rscAuth } from "@/server/lib/action";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    businessId: string;
  };
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  const user = await rscAuth();

  return (
    <LayoutWrapper>
      <LayoutHead businessId={params.businessId}>
        <MobileBar user={user} />
      </LayoutHead>
      <LayoutBody>
        <LayoutSidebarWrapper>
          <Bar user={user} />
        </LayoutSidebarWrapper>
        <LayoutContent>{children}</LayoutContent>
      </LayoutBody>
    </LayoutWrapper>
  );
};

export default Layout;
