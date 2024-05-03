import {
  LayoutBody,
  LayoutContent,
  LayoutHead,
  LayoutSidebarWrapper,
  LayoutWrapper,
} from "@/client/components/layout";
import React from "react";
import { Bar, MobileBar } from "./links";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutWrapper>
      <LayoutHead>
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
