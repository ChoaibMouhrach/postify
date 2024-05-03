import { DashboardWrapper } from "@/client/components/wrapper";
import React from "react";
import { links } from "./links";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    businessId: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  return (
    <DashboardWrapper links={links} businessId={params.businessId}>
      {children}
    </DashboardWrapper>
  );
};

export default Layout;
