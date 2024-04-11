import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex items-center justify-center container min-h-[100dvh] py-8">
      <div className="max-w-sm w-full">{children}</div>
    </main>
  );
};

export default Layout;
