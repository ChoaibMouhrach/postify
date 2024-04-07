import React from "react";
import { MobileSideBar, SideBar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex flex-col lg:flex-row items-stretch min-h-[100dvh]">
      <div className="w-60 shrink-0 hidden lg:block" />
      <MobileSideBar />
      <SideBar />
      <section className="flex-1 bg-secondary border p-4 lg:mt-4 lg:rounded-tl-md">
        {children}
      </section>
    </main>
  );
};

export default Layout;
