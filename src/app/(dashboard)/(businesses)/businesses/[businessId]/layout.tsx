import React from "react";
import {
  LayoutBody,
  LayoutContent,
  LayoutHead,
  LayoutSidebarWrapper,
  LayoutWrapper,
} from "@/client/components/layout";
import { Bar, MobileBar } from "./links";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    businessId: string;
  };
}

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  return (
    <LayoutWrapper>
      <LayoutHead businessId={params.businessId}>
        <MobileBar />
      </LayoutHead>
      <LayoutBody>
        <LayoutSidebarWrapper>
          <Bar />
        </LayoutSidebarWrapper>
        <LayoutContent> {children}</LayoutContent>
      </LayoutBody>
    </LayoutWrapper>
  );
};

export default Layout;
