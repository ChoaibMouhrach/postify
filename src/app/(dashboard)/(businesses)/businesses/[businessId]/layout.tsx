import React from "react";
import { rscAuth } from "@/server/lib/action";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { businesses } from "@/server/db/schema";
import { redirect } from "next/navigation";
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

const Layout: React.FC<LayoutProps> = async ({ params, children }) => {
  const user = await rscAuth();

  const business = await db.query.businesses.findFirst({
    where: and(
      eq(businesses.userId, user.id),
      eq(businesses.id, params.businessId),
    ),
  });

  if (!business) {
    redirect("/businesses");
  }

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
