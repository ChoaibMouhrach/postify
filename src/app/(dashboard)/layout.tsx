import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <main className="h-[100dvh] flex flex-col">{children}</main>;
};

export default Layout;
