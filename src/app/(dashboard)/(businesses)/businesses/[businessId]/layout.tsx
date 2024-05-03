import React from "react";

import { DashboardWrapper } from "@/client/components/wrapper";
import { links } from "./links";
import { rscAuth } from "@/server/lib/action";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { businesses } from "@/server/db/schema";
import { redirect } from "next/navigation";

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
    <DashboardWrapper links={links} businessId={params.businessId}>
      {children}
    </DashboardWrapper>
  );
};

export default Layout;
