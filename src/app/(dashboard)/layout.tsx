import React from "react";
import { MobileSideBar, SideBar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main>
      <div className="h-16 lg:hidden" />
      <MobileSideBar />
      <SideBar />
      <section>{children}</section>
    </main>
  );
};

export default Layout;
